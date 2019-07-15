/**@internal
 *
 */
export class MultiCastEventSource {
    constructor() {
        this.handlers = {};
    }
    _on(event, handler) {
        this.handlers[event] = this.handlers[event] || [];
        this.handlers[event].push(handler);
        return handler;
    }
    _off(event, handler) {
        if (event) {
            const hh = this.handlers[event];
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
    emit(event) {
        if (!event)
            return;
        const eventName = event.type;
        const unicast = this["on" + eventName];
        if (unicast)
            this.invoke(unicast, event);
        const multicast = this.handlers[eventName];
        if (multicast)
            multicast.forEach(h => this.invoke(h, event));
    }
    invoke(handler, event) {
        try {
            handler(event);
        }
        catch (e) {
            console.error(e);
        }
    }
}
//# sourceMappingURL=eventSource.js.map