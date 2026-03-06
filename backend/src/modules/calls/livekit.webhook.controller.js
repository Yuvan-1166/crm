import * as livekitService from "../../services/livekit.service.js";
import * as repo from "../discuss/discuss.repository.js";

/**
 * LiveKit Webhook Handler
 *
 * LiveKit sends HTTP POST webhooks for room & participant lifecycle events.
 * Each request carries a JWT in the Authorization header signed with our
 * API key/secret — we verify it via the SDK's WebhookReceiver.
 *
 * Handled events (audio calls):
 *  - room_started    → mark the call as ongoing
 *  - room_finished   → mark the call as completed, calculate duration
 *  - participant_joined  → record participant join in DB
 *  - participant_left    → record participant leave in DB
 */

/**
 * @desc   Handle incoming LiveKit webhook events
 * @route  POST /api/calls/webhook/livekit
 * @access Public (LiveKit server — verified via JWT signature)
 */
export const handleLiveKitWebhook = async (req, res) => {
  try {
    const receiver = livekitService.getWebhookReceiver();

    // Use the raw body buffer stashed by express.json({ verify }) for
    // accurate SHA-256 signature verification.  Falling back to
    // JSON.stringify would produce different bytes and always fail.
    const rawBody = req.rawBody
      ? req.rawBody.toString("utf-8")
      : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));

    const authHeader = req.get("Authorization") || "";

    let event;
    try {
      event = await receiver.receive(rawBody, authHeader);
    } catch (verifyErr) {
      console.warn("LiveKit webhook signature verification failed:", verifyErr.message);
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const eventType = event.event;
    console.log("LiveKit webhook received:", eventType);

    switch (eventType) {
      case "room_started":
        await handleRoomStarted(event);
        break;

      case "room_finished":
        await handleRoomFinished(event);
        break;

      case "participant_joined":
        await handleParticipantJoined(event);
        break;

      case "participant_left":
        await handleParticipantLeft(event);
        break;

      default:
        console.log("Unhandled LiveKit webhook event:", eventType);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error handling LiveKit webhook:", error);
    return res.status(500).json({ error: "Failed to handle webhook" });
  }
};

/* =====================================================
   EVENT HANDLERS
===================================================== */

/**
 * Room started — a LiveKit room has been created (first participant connected).
 * Ensures the corresponding discuss_call_logs row has a started_at timestamp.
 */
async function handleRoomStarted(event) {
  const roomName = event.room?.name;
  if (!roomName) return;

  try {
    const call = await repo.getActiveCallByRoomName(roomName);
    if (!call) {
      console.warn(`room_started: no active call found for room ${roomName}`);
      return;
    }
    await repo.markCallOngoing(call.call_id);
  } catch (error) {
    console.error("Error handling room_started:", error);
  }
}

/**
 * Room finished — all participants have left and the room has been destroyed.
 * Calculates duration and marks the call as completed.
 */
async function handleRoomFinished(event) {
  const roomName = event.room?.name;
  if (!roomName) return;

  try {
    const call = await repo.getActiveCallByRoomName(roomName);
    if (!call) {
      console.warn(`room_finished: no active call found for room ${roomName}`);
      return;
    }
    await repo.endCallByRoomEvent(call.call_id, call.started_at);
  } catch (error) {
    console.error("Error handling room_finished:", error);
  }
}

/**
 * Participant joined — an employee has connected to the audio call room.
 * The identity follows the pattern "emp-{empId}".
 */
async function handleParticipantJoined(event) {
  const roomName = event.room?.name;
  const identity = event.participant?.identity;
  if (!roomName || !identity) return;

  try {
    const call = await repo.getActiveCallByRoomName(roomName);
    if (!call) {
      console.warn(`participant_joined: no active call for room ${roomName}`);
      return;
    }

    // Extract emp ID from identity string "emp-42" → 42
    const empId = parseEmpId(identity);
    if (empId === null) {
      console.warn(`participant_joined: could not parse empId from identity "${identity}"`);
      return;
    }

    await repo.addCallParticipant(call.call_id, empId, identity);
  } catch (error) {
    console.error("Error handling participant_joined:", error);
  }
}

/**
 * Participant left — an employee has disconnected from the audio call room.
 */
async function handleParticipantLeft(event) {
  const roomName = event.room?.name;
  const identity = event.participant?.identity;
  if (!roomName || !identity) return;

  try {
    const call = await repo.getActiveCallByRoomName(roomName);
    if (!call) {
      console.warn(`participant_left: no active call for room ${roomName}`);
      return;
    }

    const empId = parseEmpId(identity);
    if (empId === null) {
      console.warn(`participant_left: could not parse empId from identity "${identity}"`);
      return;
    }

    await repo.markParticipantLeft(call.call_id, empId);
  } catch (error) {
    console.error("Error handling participant_left:", error);
  }
}

/* =====================================================
   HELPERS
===================================================== */

/**
 * Parse employee ID from a LiveKit participant identity string.
 * Expected format: "emp-{id}" → returns the numeric id, or null.
 */
function parseEmpId(identity) {
  const match = identity.match(/^emp-(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}
