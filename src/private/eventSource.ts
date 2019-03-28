import { Event } from '../common';

export interface Handler<E> {
    (event: E): any;
}

export class MultiCastEventSource
{
    private handlers: {};

    protected _on(event: string, handler: Handler<Event>): this {
        if (!this.handlers[event])
            this.handlers[event] = [];
        this.handlers[event].push(handler);
        return this;
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
