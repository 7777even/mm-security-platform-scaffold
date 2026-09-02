export interface VideoWallPlaybackCommand {
  action: 'play' | 'pause' | 'seek';
  scope: 'all' | 'selected';
  targetId?: string;
  percent?: number;
}

type Handler = (payload: VideoWallPlaybackCommand) => void;

const listeners = new Map<string, Set<Handler>>();

export const videoWallBus = {
  $on(event: 'playback-command', handler: Handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler);
  },
  $off(event: 'playback-command', handler: Handler) {
    listeners.get(event)?.delete(handler);
  },
  $emit(event: 'playback-command', payload: VideoWallPlaybackCommand) {
    listeners.get(event)?.forEach((handler) => handler(payload));
  },
};
