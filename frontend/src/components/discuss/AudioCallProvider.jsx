import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import * as discussService from '../../services/discussService';
import { useSocket, useSocketEvent } from '../../context/SocketContext';

/**
 * AudioCallContext — WhatsApp-style audio calling for Discuss channels.
 *
 * Call states:
 *   idle        → No call active
 *   ringing-out → Outgoing: user initiated call, waiting for others to join
 *   ringing-in  → Incoming: someone else started a call in a channel
 *   connecting  → Connecting to LiveKit room
 *   active      → In an active call
 *
 * Also tracks which channels currently have active calls so that
 * non-participants can see the "ongoing call" banner and join mid-call.
 */

const AudioCallContext = createContext(null);

export const AudioCallProvider = ({ children }) => {
  const { emit } = useSocket();

  // Call state
  const [callState, setCallState] = useState('idle');
  const [callChannelId, setCallChannelId] = useState(null);
  const [callChannelName, setCallChannelName] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);

  // Track channels with ongoing calls (Map<channelId, { callerName, callerEmpId, startedAt }>)
  const [activeCallChannels, setActiveCallChannels] = useState({});

  // Refs
  const roomRef = useRef(null);
  const durationTimerRef = useRef(null);
  const ringingTimerRef = useRef(null);
  const disconnectingRef = useRef(false); // guard against recursive disconnect

  useEffect(() => {
    return () => {
      disconnectingRef.current = true;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (ringingTimerRef.current) clearTimeout(ringingTimerRef.current);
    };
  }, []);

  const syncParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const parts = [];
    const local = room.localParticipant;
    if (local) {
      parts.push({
        identity: local.identity,
        name: local.name || local.identity,
        isLocal: true,
        isMuted: !local.isMicrophoneEnabled,
      });
    }
    room.remoteParticipants.forEach((p) => {
      parts.push({
        identity: p.identity,
        name: p.name || p.identity,
        isLocal: false,
        isMuted: !p.isMicrophoneEnabled,
      });
    });
    setParticipants(parts);
  }, []);

  const connectToRoom = useCallback(async (channelId) => {
    try {
      setCallState('connecting');

      const { token, wsUrl } = await discussService.getCallToken(channelId);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      room.on(RoomEvent.ParticipantConnected, () => syncParticipants());
      room.on(RoomEvent.ParticipantDisconnected, () => syncParticipants());
      room.on(RoomEvent.TrackMuted, () => syncParticipants());
      room.on(RoomEvent.TrackUnmuted, () => syncParticipants());

      // Attach remote audio tracks so they actually play through speakers
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === 'audio') {
          const audio = track.attach();
          audio.autoplay = true;
          audio.dataset.livekitTrack = track.sid;
          let container = document.getElementById('livekit-audio-container');
          if (!container) {
            container = document.createElement('div');
            container.id = 'livekit-audio-container';
            container.style.display = 'none';
            document.body.appendChild(container);
          }
          container.appendChild(audio);
          track.on('ended', () => audio.remove());
        }
      });

      // Detach audio elements when remote tracks are unsubscribed
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === 'audio') {
          track.detach().forEach((el) => el.remove());
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        // Only clean up if we didn't initiate the disconnect ourselves
        if (!disconnectingRef.current) {
          resetLocalState();
        }
      });

      await room.connect(wsUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;
      disconnectingRef.current = false;
      setCallState('active');
      setCallDuration(0);
      syncParticipants();

      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return true;
    } catch (err) {
      console.error('Failed to connect to call:', err);
      resetLocalState();
      return false;
    }
  }, [syncParticipants]);

  /**
   * Reset only local UI state — does NOT disconnect the room or emit socket events.
   */
  const resetLocalState = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (ringingTimerRef.current) {
      clearTimeout(ringingTimerRef.current);
      ringingTimerRef.current = null;
    }
    // Remove all attached LiveKit audio elements
    const audioContainer = document.getElementById('livekit-audio-container');
    if (audioContainer) audioContainer.innerHTML = '';
    roomRef.current = null;
    setCallState('idle');
    setCallChannelId(null);
    setCallChannelName('');
    setParticipants([]);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeaker(false);
    setIncomingCall(null);
  }, []);

  /**
   * Start a new outgoing call
   */
  const startCall = useCallback(async (channelId, channelName, callerName) => {
    if (callState !== 'idle') return false;

    setCallState('ringing-out');
    setCallChannelId(channelId);
    setCallChannelName(channelName || `Channel ${channelId}`);

    // Signal other channel members
    emit('call:start', { channelId, callerName, channelName });

    // Mark this channel as having an active call (for our own UI too)
    setActiveCallChannels((prev) => ({
      ...prev,
      [channelId]: { callerName, startedAt: Date.now() },
    }));

    const success = await connectToRoom(channelId);
    if (!success) {
      setActiveCallChannels((prev) => {
        const next = { ...prev };
        delete next[channelId];
        return next;
      });
      resetLocalState();
      return false;
    }

    // Auto-end after 60s if nobody joins
    ringingTimerRef.current = setTimeout(() => {
      if (roomRef.current && roomRef.current.remoteParticipants.size === 0) {
        leaveCall();
      }
    }, 60000);

    return true;
  }, [callState, connectToRoom, emit, resetLocalState]);

  /**
   * Accept an incoming call
   */
  const acceptCall = useCallback(async () => {
    if (!incomingCall) return false;

    const { channelId, channelName } = incomingCall;
    setCallChannelId(channelId);
    setCallChannelName(channelName || `Channel ${channelId}`);
    setIncomingCall(null);

    const success = await connectToRoom(channelId);
    if (!success) {
      resetLocalState();
      return false;
    }
    return true;
  }, [incomingCall, connectToRoom, resetLocalState]);

  /**
   * Join an ongoing call in a channel (mid-call join from chat log)
   */
  const joinCall = useCallback(async (channelId, channelName) => {
    if (callState !== 'idle') return false;

    setCallChannelId(channelId);
    setCallChannelName(channelName || `Channel ${channelId}`);

    const success = await connectToRoom(channelId);
    if (!success) {
      resetLocalState();
      return false;
    }
    return true;
  }, [callState, connectToRoom, resetLocalState]);

  /**
   * Reject an incoming call
   */
  const rejectCall = useCallback(() => {
    if (incomingCall) {
      emit('call:reject', { channelId: incomingCall.channelId });
    }
    setIncomingCall(null);
    setCallState('idle');
  }, [incomingCall, emit]);

  /**
   * Leave / end the current call
   */
  const leaveCall = useCallback(() => {
    const channelId = callChannelId;

    // Guard against re-entrant disconnect
    disconnectingRef.current = true;

    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    if (channelId) {
      emit('call:end', { channelId });
      // Remove from active call channels
      setActiveCallChannels((prev) => {
        const next = { ...prev };
        delete next[channelId];
        return next;
      });
    }

    resetLocalState();
    disconnectingRef.current = false;
  }, [callChannelId, emit, resetLocalState]);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const newMuted = !isMuted;
    await room.localParticipant.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
    syncParticipants();
  }, [isMuted, syncParticipants]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeaker((prev) => !prev);
  }, []);

  /**
   * Handle incoming call:start from socket
   */
  const handleIncomingCall = useCallback((data) => {
    // Track this channel as having an active call
    setActiveCallChannels((prev) => ({
      ...prev,
      [data.channelId]: {
        callerName: data.callerName || 'Someone',
        callerEmpId: data.callerEmpId,
        channelName: data.channelName || '',
        startedAt: Date.now(),
      },
    }));

    // Don't show ringing popup if already in a call
    if (callState !== 'idle') return;

    setCallState('ringing-in');
    setIncomingCall({
      channelId: data.channelId,
      channelName: data.channelName || '',
      callerName: data.callerName || 'Someone',
      callerEmpId: data.callerEmpId,
    });

    ringingTimerRef.current = setTimeout(() => {
      setIncomingCall((prev) => {
        if (prev?.channelId === data.channelId) {
          setCallState('idle');
          return null;
        }
        return prev;
      });
    }, 30000);
  }, [callState]);

  /**
   * Handle call:end from socket
   */
  const handleCallEnded = useCallback((data) => {
    // Remove from active call channels
    setActiveCallChannels((prev) => {
      const next = { ...prev };
      delete next[data.channelId];
      return next;
    });

    // If we have an incoming call for this channel, dismiss it
    if (incomingCall?.channelId === data.channelId && callState === 'ringing-in') {
      resetLocalState();
      return;
    }

    // If we're in a call on this channel, check if we should auto-leave
    if (callChannelId === data.channelId && roomRef.current) {
      if (roomRef.current.remoteParticipants.size === 0) {
        leaveCall();
      }
    }
  }, [incomingCall, callState, callChannelId, resetLocalState, leaveCall]);

  useSocketEvent('call:start', handleIncomingCall);
  useSocketEvent('call:end', handleCallEnded);

  const value = {
    // State
    callState,
    callChannelId,
    callChannelName,
    isMuted,
    isSpeaker,
    participants,
    callDuration,
    incomingCall,
    activeCallChannels,

    // Actions
    startCall,
    acceptCall,
    rejectCall,
    joinCall,
    leaveCall,
    toggleMute,
    toggleSpeaker,
  };

  return (
    <AudioCallContext.Provider value={value}>
      {children}
    </AudioCallContext.Provider>
  );
};

export const useAudioCall = () => {
  const ctx = useContext(AudioCallContext);
  if (!ctx) throw new Error('useAudioCall must be used within AudioCallProvider');
  return ctx;
};
