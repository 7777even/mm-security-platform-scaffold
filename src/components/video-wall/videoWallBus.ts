type Handler = (payload: unknown) => void;

const listeners = new Map<string, Set<Handler>>();

export const videoWallBus = {
  $on<T = unknown>(event: string, handler: (payload: T) => void) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler as unknown as Handler);
  },
  $off<T = unknown>(event: string, handler: (payload: T) => void) {
    listeners.get(event)?.delete(handler as unknown as Handler);
  },
  $emit<T = unknown>(event: string, payload: T) {
    listeners.get(event)?.forEach((handler) => handler(payload));
  },
};
