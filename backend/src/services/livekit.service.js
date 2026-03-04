import { AccessToken } from "livekit-server-sdk";

/**
 * LiveKit Service — generates access tokens for audio calls in Discuss.
 *
 * Each channel call maps to a LiveKit room named: call-{companyId}-{channelId}
 * Tokens are scoped per-room with a 4-hour TTL.
 */

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL; // wss://…

/**
 * Build the room name for a channel call.
 * Format: call-{companyId}-{channelId}
 */
export const buildRoomName = (companyId, channelId) =>
  `call-${companyId}-${channelId}`;

/**
 * Generate a LiveKit access token for a participant to join a room.
 *
 * @param {string} roomName   - LiveKit room to join
 * @param {string} identity   - Unique participant identity (e.g. "emp-42")
 * @param {string} name       - Display name shown to other participants
 * @returns {Promise<string>} - Signed JWT token
 */
export const generateToken = async (roomName, identity, name) => {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    throw new Error(
      "LiveKit not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env"
    );
  }

  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: "4h",
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return await token.toJwt();
};

/**
 * Get the LiveKit WebSocket URL for client connections.
 */
export const getWsUrl = () => {
  if (!LIVEKIT_URL) {
    throw new Error("LIVEKIT_URL not configured in .env");
  }
  return LIVEKIT_URL;
};
