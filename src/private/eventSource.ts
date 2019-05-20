import { Event } from '../common';

/**@internal
 *
 */
export interface Handler<E> {
    (event: E): any;
}

/**@internal
 *
 */
export class MultiCastEventSource
{
    private handlers: {} = {};

    protected _on(event: string, handler: Handler<Event>): Handler<Event> {
        // TODO: use WeakMaps instead of Arrays to prevent a memory leak when subscribers forgets to unsubscribe.
        // With the current implementation subscribers MUST unsubscribe, or handlers will never be garbage-collected!

        if (!this.handlers[event])
            this.handlers[event] = [];
        this.handlers[event].push(handler);
        return handler;
    }

    protected _off(event?: string, handler?: Handler<Event>): this {
        if (event) {
            var hh = this.handlers[event] as Handler<Event>[];
            if (hh) {
                if (handler)
                    this.handlers[event] = hh.filter(h => h !== handler);
                else
                    delete this.handlers[event];
            }
        }
        else
            this.handlers = {};
        return this;
    }

    protected emit(event: Event): void {
        if (!event) return;

        var eventName: string = event.type;
        var unicast: Handler<Event> = this["on" + eventName];
        if (unicast)
            this.invoke(unicast, event);

        var multicast: Handler<Event>[] = this.handlers[eventName];
        if (multicast)
            multicast.forEach(h => this.invoke(h, event));
    }

    private invoke(handler: Handler<Event>, event: Event) {
        try {
            handler(event);
        } catch (e) {
            console.error(e);
        }
    }

}
