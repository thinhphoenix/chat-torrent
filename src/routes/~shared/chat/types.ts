export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'system';
  content: string;
  timestamp: number;
}

export interface PeerInfo {
  id: string;
  name: string;
}

export interface RoomMeta {
  roomId: string;
  password?: string;
  hostId: string;
}

export type ControlAction =
  | { type: 'kick'; targetId: string }
  | { type: 'room-close' }
  | { type: 'host-announce'; hostId: string };

export interface ProfilePayload {
  name: string;
}

export interface MessagePayload {
  id: string;
  type: 'text';
  content: string;
  senderName: string;
  timestamp: number;
}

export interface MatchmakingPayload {
  type: 'seek' | 'match';
  roomId?: string;
  password?: string;
}
