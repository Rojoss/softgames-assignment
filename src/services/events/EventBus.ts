type EventMap = Record<string, unknown>;

type EventListener<TPayload> = [TPayload] extends [void] ? () => void : (payload: TPayload) => void;
type DispatchArgs<TPayload> = [TPayload] extends [void] ? [] : [payload: TPayload];

export class EventBus<TEvents extends EventMap> {
  private readonly listeners: Partial<Record<keyof TEvents, Set<(payload: unknown) => void>>> = {};

  public dispatch<TEvent extends keyof TEvents>(event: TEvent, ...args: DispatchArgs<TEvents[TEvent]>): void {
    const payload = args[0] as TEvents[TEvent];
    const eventListeners = this.listeners[event];

    if (!eventListeners) {
      return;
    }

    for (const listener of eventListeners) {
      listener(payload);
    }
  }

  public subscribe<TEvent extends keyof TEvents>(event: TEvent, listener: EventListener<TEvents[TEvent]>): () => void {
    const eventListeners = this.getListeners(event);
    const typedListener = listener as (payload: unknown) => void;

    eventListeners.add(typedListener);

    return () => {
      eventListeners.delete(typedListener);

      if (eventListeners.size === 0) {
        delete this.listeners[event];
      }
    };
  }

  private getListeners<TEvent extends keyof TEvents>(event: TEvent): Set<(payload: unknown) => void> {
    let eventListeners = this.listeners[event];

    if (!eventListeners) {
      eventListeners = new Set<(payload: unknown) => void>();
      this.listeners[event] = eventListeners;
    }

    return eventListeners;
  }
}
