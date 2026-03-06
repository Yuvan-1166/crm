import { AccessToken, RoomServiceClient, WebhookReceiver, TrackSource } from "livekit-server-sdk";

/**
 * LiveKit Service — manages audio-only call rooms for Discuss (Team Chat).
 *
 * Key design choices for AUDIO calls (vs video):
 *  - Token grants restrict publishing to MICROPHONE only (no camera/screen-share).
 *  - Rooms use a shorter emptyTimeout (120 s) since audio calls end quickly
 *    once the last person hangs up.
 *  - maxParticipants defaults to 20 (voice huddle, not a webinar).
 *
 * Room naming: call-{companyId}-{channelId}
 * Tokens are scoped per-room with a 4-hour TTL.
 */

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL; // wss://…

/* =====================================================
   ROOM SERVICE CLIENT (server-side room management)
===================================================== */

let roomService = null;

/**
 * Lazily initialise the RoomServiceClient so we don't throw at import-time
 * when env vars are missing (tests, builds, etc.).
 */
const getRoomService = () => {
  if (roomService) return roomService;
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error(
      "LiveKit not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in .env"
    );
  }
  // RoomServiceClient needs the HTTP(S) URL, not the WSS URL.
  const httpUrl = LIVEKIT_URL.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
  roomService = new RoomServiceClient(httpUrl, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  return roomService;
};

/* =====================================================
   WEBHOOK RECEIVER (verify LiveKit webhook signatures)
===================================================== */

let webhookReceiver = null;

/**
 * Get (or create) a WebhookReceiver to verify incoming LiveKit webhooks.
 */
export const getWebhookReceiver = () => {
  if (webhookReceiver) return webhookReceiver;
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error("LiveKit credentials required for webhook verification");
  }
  webhookReceiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  return webhookReceiver;
};

/* =====================================================
   ROOM NAME HELPER
===================================================== */

/**
 * Build the room name for a channel audio call.
 * Format: call-{companyId}-{channelId}
 */
export const buildRoomName = (companyId, channelId) =>
  `call-${companyId}-${channelId}`;

/* =====================================================
   TOKEN GENERATION (audio-only grants)
===================================================== */

/**
 * Generate a LiveKit access token for a participant to join an audio call.
 *
 * The token enforces audio-only by restricting publishable sources to
 * MICROPHONE — the LiveKit SFU will reject any video track publish attempt.
 *
 * @param {string} roomName   - LiveKit room to join
 * @param {string} identity   - Unique participant identity (e.g. "emp-42")
 * @param {string} name       - Display name shown to other participants
 * @param {object} [opts]     - Extra options
 * @param {string} [opts.metadata] - Arbitrary metadata attached to the participant
 * @returns {Promise<string>} - Signed JWT token
 */
export const generateToken = async (roomName, identity, name, opts = {}) => {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error(
      "LiveKit not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env"
    );
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: "4h",
    metadata: opts.metadata,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    // Restrict to audio sources only — no camera or screen-share.
    // Must use the TrackSource enum (numeric), NOT the string "MICROPHONE".
    canPublishSources: [TrackSource.MICROPHONE],
  });

  return await token.toJwt();
};

/* =====================================================
   ROOM MANAGEMENT
===================================================== */

/**
 * Create a new audio call room on the LiveKit server.
 *
 * @param {object} options
 * @param {string} options.name            - Room name (use buildRoomName())
 * @param {number} [options.emptyTimeout]  - Seconds before empty room is destroyed (default 120)
 * @param {number} [options.maxParticipants] - Max participants (default 20)
 * @returns {Promise<object>} - Created room object
 */
export const createRoom = async (options) => {
  try {
    const svc = getRoomService();
    const room = await svc.createRoom({
      name: options.name,
      emptyTimeout: options.emptyTimeout || 120,   // 2 min for audio calls
      maxParticipants: options.maxParticipants || 20,
    });
    return room;
  } catch (error) {
    console.error("Error creating LiveKit room:", error);
    throw error;
  }
};

/**
 * Get information about an existing room.
 *
 * @param {string} roomName
 * @returns {Promise<object|null>} - Room object or null if not found
 */
export const getRoomInfo = async (roomName) => {
  try {
    const svc = getRoomService();
    const rooms = await svc.listRooms([roomName]);
    return rooms.length > 0 ? rooms[0] : null;
  } catch (error) {
    // Room-not-found is expected when no active call exists — return null.
    // Only re-throw if it's a genuine connectivity/auth error.
    const msg = (error?.message || "").toLowerCase();
    if (msg.includes("not found") || msg.includes("404")) {
      return null;
    }
    console.error("Error getting room info:", error);
    throw error;
  }
};

/**
 * List all participants currently in a room.
 *
 * @param {string} roomName
 * @returns {Promise<Array>} - Array of participant objects
 */
export const listParticipants = async (roomName) => {
  try {
    const svc = getRoomService();
    return await svc.listParticipants(roomName);
  } catch (error) {
    console.error("Error listing participants:", error);
    throw error;
  }
};

/**
 * End an audio call room (disconnects all participants and destroys the room).
 *
 * @param {string} roomName
 */
export const endRoom = async (roomName) => {
  try {
    const svc = getRoomService();
    await svc.deleteRoom(roomName);
  } catch (error) {
    console.error("Error ending room:", error);
    throw error;
  }
};

/**
 * Remove a single participant from an audio call.
 *
 * @param {string} roomName
 * @param {string} participantIdentity - e.g. "emp-42"
 */
export const removeParticipant = async (roomName, participantIdentity) => {
  try {
    const svc = getRoomService();
    await svc.removeParticipant(roomName, participantIdentity);
  } catch (error) {
    console.error("Error removing participant:", error);
    throw error;
  }
};

/* =====================================================
   WEBSOCKET URL
===================================================== */

/**
 * Get the LiveKit WebSocket URL for client connections.
 */
export const getWsUrl = () => {
  if (!LIVEKIT_URL) {
    throw new Error("LIVEKIT_URL not configured in .env");
  }
  return LIVEKIT_URL;
};
