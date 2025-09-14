export type Handler<Payload> = (payload: Payload) => void | Promise<void>;

/**
 * Generic, strongly-typed event bus implementation for client-side code. No external dependencies,
 * pure Typescript POWER.
 */
export class EventBus<EventMap extends object = object> {
    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                         UNKNOWN                                         ?//
    ///
    //# The unknown type here was ai's idea, and I found it quite ingenious. It is certainly
    //# better than 'any' (pun intended) typing I was able to come up with here... In it's own words:
    //#
    //# Internal registry mapping an event name to a Set of handlers. Using a Set guarantees O(1)
    //# insertion/removal while also preventing duplicates. We store the handlers as unknown to avoid leaking
    //# the payload type information across different events. Each accessor/mutator narrows the
    //# type back to the correct Handler<EventMap[K]>.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    private readonly handlers = new Map<
        keyof EventMap,
        Set<Handler<unknown>>
    >();

    //~-----------------------------------------------------------------------------------------~//
    //$                                     HANDLER REGISTRY                                    $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Registers a new handler for a given event.
     *
     * @param event - The event to listen to.
     * @param handler - The handler to call when the event is emitted.
     * @returns A function to unsubscribe the handler.
     */
    public on<K extends keyof EventMap>(
        event: K,
        handler: Handler<EventMap[K]>
    ): () => void {
        const set = this.getHandlerSet(event) as Set<Handler<EventMap[K]>>;
        set.add(handler);

        // Return an unsubscribe function purely for convenience.
        return () => this.off(event, handler);
    }

    /**
     * Registers a new handler for a given event that will be called only once.
     *
     * @param event - The event to listen to.
     * @param handler - The handler to call when the event is emitted.
     * @returns A function to unsubscribe the handler.
     */
    public once<K extends keyof EventMap>(
        event: K,
        handler: Handler<EventMap[K]>
    ): () => void {
        const onceHandler: Handler<EventMap[K]> = async (payload) => {
            try {
                await handler(payload);
            } finally {
                // This is important, it ensures removal even if the handler throws.
                this.off(event, onceHandler);
            }
        };
        return this.on(event, onceHandler);
    }

    /**
     * Removes a handler for a given event.
     *
     * @param event - The event to remove the handler from.
     * @param handler - The handler to remove.
     */
    public off<K extends keyof EventMap>(
        event: K,
        handler: Handler<EventMap[K]>
    ): void {
        const set = this.handlers.get(event) as
            | Set<Handler<EventMap[K]>>
            | undefined;
        if (set) {
            set.delete(handler);
            if (set.size === 0) this.handlers.delete(event);
        }
    }

    /**
     * Removes ALL listeners. Pass an event to clear only listeners for that event.
     *
     * @param event - The event to remove the listeners from.
     */
    public removeAllListeners<K extends keyof EventMap>(event?: K): void {
        if (event != null) {
            this.handlers.delete(event);
        } else {
            this.handlers.clear();
        }
    }

    public listenerCount<K extends keyof EventMap>(event: K): number {
        return this.handlers.get(event)?.size ?? 0;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         EMITTER                                         $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Emits an event and waits for all handlers (including async ones) to settle. Returns an array of
     * settled results the same as Promise.allSettled allowing caller-side introspection if needed.
     *
     * @param event - The event to emit.
     * @param payload - The payload to emit.
     * @returns An array of settled results.
     */
    public async emit<K extends keyof EventMap>(
        event: K,
        payload: EventMap[K]
    ): Promise<PromiseSettledResult<void>[]> {
        const set = this.handlers.get(event) as
            | Set<Handler<EventMap[K]>>
            | undefined;

        if (!set || set.size === 0) return [];

        const executions: Promise<void>[] = [];

        // Wrap each listener with try/catch to prevent them from crashing each other.
        set.forEach((listener) => {
            const maybePromise = (async () => {
                try {
                    await listener(payload);
                } catch (error) {
                    // Re-throw so it can be captured later in allSettled result.
                    throw error instanceof Error
                        ? error
                        : new Error(String(error));
                }
            })();
            executions.push(maybePromise);
        });

        return Promise.allSettled(executions);
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                     PRIVATE METHODS                                     $//
    //~-----------------------------------------------------------------------------------------~//

    private getHandlerSet<K extends keyof EventMap>(
        event: K
    ): Set<Handler<unknown>> {
        let set = this.handlers.get(event);
        if (!set) {
            set = new Set<Handler<unknown>>();
            // AI: The internal map is typed with unknown; a cast is required
            // but it is safe because we exclusively populate the set within
            // this scoped generic where K is known.
            this.handlers.set(event, set);
        }
        return set;
    }
}
