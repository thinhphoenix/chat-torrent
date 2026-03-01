import { useCallback, useEffect, useRef, useState } from 'react';
import { joinRoom, selfId } from 'trystero/torrent';
import { getAnimalName } from '@/routes/~shared/chat/animal-name';
import { createRoomId } from '@/routes/~shared/chat/room-link';
import type {
  ChatMessage,
  ControlAction,
  MessagePayload,
  PeerInfo,
  ProfilePayload,
} from '@/routes/~shared/chat/types';

const APP_ID = 'p2p-chat-trystero-app';
const RELAY_URLS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.btorrent.xyz',
];
const MATCHMAKING_ROOM = '__matchmaking_lobby__';

interface UseP2PChatReturn {
  roomId: string;
  password?: string;
  myName: string;
  myId: string;
  isHost: boolean;
  hostId: string;
  peers: PeerInfo[];
  messages: ChatMessage[];
  connected: boolean;
  matchmaking: boolean;
  sendMessage: (content: string) => void;
  kickPeer: (peerId: string) => void;
  leaveRoom: () => void;
  joinRoomById: (roomId: string, password?: string) => void;
  setRoomPassword: (password: string) => void;
  connectRandom: () => void;
  cancelMatchmaking: () => void;
}

export function useP2PChat(
  initialRoomId?: string | null,
  initialPassword?: string | null,
): UseP2PChatReturn {
  const myName = useRef(getAnimalName());
  const myId = selfId;

  const [roomId, setRoomId] = useState(() => initialRoomId || createRoomId());
  const [password, setPassword] = useState<string | undefined>(
    initialPassword || undefined,
  );
  const [isHost, setIsHost] = useState(!initialRoomId);
  const [hostId, setHostId] = useState(!initialRoomId ? selfId : '');
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [matchmaking, setMatchmaking] = useState(false);

  const roomRef = useRef<ReturnType<typeof joinRoom> | null>(null);
  const matchRoomRef = useRef<ReturnType<typeof joinRoom> | null>(null);
  const actionsRef = useRef<{
    sendMessage?: (data: MessagePayload, target?: string) => void;
    sendProfile?: (data: ProfilePayload, target?: string) => void;
    sendControl?: (data: ControlAction, target?: string) => void;
  }>({});

  const addSystemMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}-${Math.random()}`,
        senderId: 'system',
        senderName: 'System',
        type: 'system',
        content,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const setupRoom = useCallback(
    (rid: string, pw?: string, asHost?: boolean) => {
      // Leave old room
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }

      const config: {
        appId: string;
        relayUrls: string[];
        password?: string;
      } = {
        appId: APP_ID,
        relayUrls: RELAY_URLS,
      };
      if (pw) config.password = pw;

      const room = joinRoom(config, rid);
      roomRef.current = room;

      const hosting = asHost ?? false;
      setRoomId(rid);
      setPassword(pw);
      setIsHost(hosting);
      setHostId(hosting ? selfId : '');
      setPeers([]);
      setMessages([]);
      setConnected(true);

      addSystemMessage(
        hosting
          ? `You created room "${rid}". You are the host.`
          : `You joined room "${rid}".`,
      );

      // Setup actions - use 'any' to bypass trystero's DataPayload constraint
      // since our interfaces are structurally compatible with JsonValue
      // biome-ignore lint/suspicious/noExplicitAny: trystero DataPayload constraint
      const [sendMessage, getMessage] = room.makeAction<any>('message');
      // biome-ignore lint/suspicious/noExplicitAny: trystero DataPayload constraint
      const [sendProfile, getProfile] = room.makeAction<any>('profile');
      // biome-ignore lint/suspicious/noExplicitAny: trystero DataPayload constraint
      const [sendControl, getControl] = room.makeAction<any>('control');

      actionsRef.current = {
        sendMessage: sendMessage as (
          data: MessagePayload,
          target?: string,
        ) => void,
        sendProfile: sendProfile as (
          data: ProfilePayload,
          target?: string,
        ) => void,
        sendControl: sendControl as (
          data: ControlAction,
          target?: string,
        ) => void,
      };

      // On peer join
      room.onPeerJoin((peerId) => {
        // Send our profile to the new peer
        sendProfile({ name: myName.current }, peerId);

        // If we are host, announce host status
        if (hosting) {
          sendControl({ type: 'host-announce', hostId: selfId }, peerId);
        }

        setPeers((prev) => {
          if (prev.find((p) => p.id === peerId)) return prev;
          return [...prev, { id: peerId, name: peerId.slice(0, 8) }];
        });

        addSystemMessage(`A peer connected.`);
      });

      // On peer leave
      room.onPeerLeave((peerId) => {
        setPeers((prev) => {
          const peer = prev.find((p) => p.id === peerId);
          if (peer) {
            addSystemMessage(`${peer.name} left the room.`);
          }
          return prev.filter((p) => p.id !== peerId);
        });
      });

      // Handle incoming messages
      getMessage((data, peerId) => {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            senderId: peerId,
            senderName: data.senderName,
            type: data.type,
            content: data.content,
            timestamp: data.timestamp,
          },
        ]);
      });

      // Handle profile updates
      getProfile((data, peerId) => {
        setPeers((prev) => {
          const existing = prev.find((p) => p.id === peerId);
          if (existing) {
            return prev.map((p) =>
              p.id === peerId ? { ...p, name: data.name } : p,
            );
          }
          return [...prev, { id: peerId, name: data.name }];
        });
      });

      // Handle control messages
      getControl((data) => {
        if (data.type === 'host-announce') {
          setHostId(data.hostId);
        }

        if (data.type === 'kick' && data.targetId === selfId) {
          // We got kicked
          addSystemMessage('You were kicked from the room.');
          room.leave();
          roomRef.current = null;

          // Create new room as host
          const newRoomId = createRoomId();
          setTimeout(() => {
            setupRoom(newRoomId, undefined, true);
            addSystemMessage('You are now in your own room as host.');
          }, 100);
        }

        if (data.type === 'room-close') {
          // Host closed the room
          addSystemMessage('The host closed the room.');
          room.leave();
          roomRef.current = null;

          // Create new room as host
          const newRoomId = createRoomId();
          setTimeout(() => {
            setupRoom(newRoomId, undefined, true);
            addSystemMessage('You are now in your own room as host.');
          }, 100);
        }
      });

      return room;
    },
    [addSystemMessage],
  );

  // On peer leave, detect if host left
  useEffect(() => {
    if (!hostId || hostId === selfId) return;

    // Check if host is still in peers
    const hostStillPresent = peers.some((p) => p.id === hostId);
    if (
      !hostStillPresent &&
      peers.length === 0 &&
      connected &&
      hostId !== selfId
    ) {
      // Host might have left (room is empty). Only trigger if we were connected and now empty.
      // We need to wait a bit because peers might still be loading
    }
  }, [peers, hostId, connected]);

  // Initial room setup - uses refs to capture values at mount time
  const initialRoomRef = useRef({ roomId, password, isHost });
  const setupRoomRef = useRef(setupRoom);
  setupRoomRef.current = setupRoom;

  useEffect(() => {
    const { roomId: rid, password: pw, isHost: host } = initialRoomRef.current;
    const room = setupRoomRef.current(rid, pw, host);
    return () => {
      room.leave();
      roomRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((content: string) => {
    const payload: MessagePayload = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: 'text',
      content,
      senderName: myName.current,
      timestamp: Date.now(),
    };

    // Always add to local messages
    setMessages((prev) => [
      ...prev,
      {
        id: payload.id,
        senderId: selfId,
        senderName: myName.current,
        type: payload.type,
        content: payload.content,
        timestamp: payload.timestamp,
      },
    ]);

    // Send to peers if connected
    actionsRef.current.sendMessage?.(payload);
  }, []);

  const kickPeer = useCallback(
    (peerId: string) => {
      if (!isHost || !actionsRef.current.sendControl) return;
      actionsRef.current.sendControl(
        { type: 'kick', targetId: peerId },
        peerId,
      );
      // Also broadcast to others so they see the kick
      actionsRef.current.sendControl({ type: 'kick', targetId: peerId });
      setPeers((prev) => {
        const kicked = prev.find((p) => p.id === peerId);
        if (kicked) {
          addSystemMessage(`${kicked.name} was kicked.`);
        }
        return prev.filter((p) => p.id !== peerId);
      });
    },
    [isHost, addSystemMessage],
  );

  const leaveRoom = useCallback(() => {
    if (isHost && actionsRef.current.sendControl) {
      // Notify all peers that host is closing the room
      actionsRef.current.sendControl({ type: 'room-close' });
    }

    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
    }

    // Create new room as host
    const newRoomId = createRoomId();
    setupRoom(newRoomId, undefined, true);
  }, [isHost, setupRoom]);

  const joinRoomById = useCallback(
    (newRoomId: string, pw?: string) => {
      if (roomRef.current) {
        if (isHost && actionsRef.current.sendControl) {
          actionsRef.current.sendControl({ type: 'room-close' });
        }
        roomRef.current.leave();
        roomRef.current = null;
      }
      setupRoom(newRoomId, pw, false);
    },
    [isHost, setupRoom],
  );

  const connectRandom = useCallback(() => {
    setMatchmaking(true);

    const config = {
      appId: APP_ID,
      relayUrls: RELAY_URLS,
    };

    const matchRoom = joinRoom(config, MATCHMAKING_ROOM);
    matchRoomRef.current = matchRoom;

    // biome-ignore lint/suspicious/noExplicitAny: trystero DataPayload constraint
    const [sendMatch, getMatch] = matchRoom.makeAction<any>('matchmaking');

    // When we find another seeker
    matchRoom.onPeerJoin((peerId) => {
      // Deterministic: lower ID initiates
      if (selfId < peerId) {
        const newRoomId = createRoomId();
        const newPassword = Math.random().toString(36).slice(2, 10);
        sendMatch(
          { type: 'match', roomId: newRoomId, password: newPassword },
          peerId,
        );

        // Leave matchmaking and join private room
        setTimeout(() => {
          matchRoom.leave();
          matchRoomRef.current = null;
          setMatchmaking(false);

          if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
          }
          setupRoom(newRoomId, newPassword, true);
        }, 500);
      }
    });

    getMatch((data) => {
      if (data.type === 'match' && data.roomId) {
        // We got matched
        setTimeout(() => {
          matchRoom.leave();
          matchRoomRef.current = null;
          setMatchmaking(false);

          if (roomRef.current) {
            roomRef.current.leave();
            roomRef.current = null;
          }
          setupRoom(data.roomId!, data.password, false);
        }, 500);
      }
    });
  }, [setupRoom]);

  const cancelMatchmaking = useCallback(() => {
    if (matchRoomRef.current) {
      matchRoomRef.current.leave();
      matchRoomRef.current = null;
    }
    setMatchmaking(false);
  }, []);

  const setRoomPassword = useCallback(
    (pw: string) => {
      if (!isHost) return;
      // Notify peers to rejoin with new password
      if (actionsRef.current.sendControl) {
        actionsRef.current.sendControl({ type: 'room-close' });
      }
      // Recreate room with same ID but new password
      setupRoom(roomId, pw || undefined, true);
    },
    [isHost, roomId, setupRoom],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (matchRoomRef.current) {
        matchRoomRef.current.leave();
      }
    };
  }, []);

  return {
    roomId,
    password,
    myName: myName.current,
    myId,
    isHost,
    hostId,
    peers,
    messages,
    connected,
    matchmaking,
    sendMessage,
    kickPeer,
    leaveRoom,
    joinRoomById,
    setRoomPassword,
    connectRandom,
    cancelMatchmaking,
  };
}
