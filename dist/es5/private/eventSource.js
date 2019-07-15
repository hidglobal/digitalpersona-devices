/**@internal
 *
 */
var MultiCastEventSource = /** @class */ (function () {
    function MultiCastEventSource() {
        this.handlers = {};
    }
    MultiCastEventSource.prototype._on = function (event, handler) {
        this.handlers[event] = this.handlers[event] || [];
        this.handlers[event].push(handler);
        return handler;
    };
    MultiCastEventSource.prototype._off = function (event, handler) {
        if (event) {
            var hh = this.handlers[event];
            if (hh) {
                if (handler)
                    this.handlers[event] = hh.filter(function (h) { return h !== handler; });
                else
                    delete this.handlers[event];
            }
        }
        else
            this.handlers = {};
        return this;
    };
    MultiCastEventSource.prototype.emit = function (event) {
        var _this = this;
        if (!event)
            return;
        var eventName = event.type;
        var unicast = this["on" + eventName];
        if (unicast)
            this.invoke(unicast, event);
        var multicast = this.handlers[eventName];
        if (multicast)
            multicast.forEach(function (h) { return _this.invoke(h, event); });
    };
    MultiCastEventSource.prototype.invoke = function (handler, event) {
        try {
            handler(event);
        }
        catch (e) {
            console.error(e);
        }
    };
    return MultiCastEventSource;
}());
export { MultiCastEventSource };
//# sourceMappingURL=eventSource.js.map