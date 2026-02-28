function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createRoomId(): string {
  return generateRoomId();
}

export function buildShareLink(roomId: string): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('room', roomId);
  return url.toString();
}

export function parseShareLink(): { roomId: string | null } {
  const params = new URLSearchParams(window.location.search);
  return { roomId: params.get('room') };
}

export function clearUrlParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('room');
  url.hash = '';
  window.history.replaceState({}, '', url.toString());
}
