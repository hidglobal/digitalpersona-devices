import * as tslib_1 from "tslib";
/**
 * A base class for DigitalPersona events.
 */
var Event = /** @class */ (function () {
    function Event(type) {
        this.type = type;
    }
    return Event;
}());
export { Event };
/**
 * An event signaling a problem with a device channel communication.
 */
var CommunicationFailed = /** @class */ (function (_super) {
    tslib_1.__extends(CommunicationFailed, _super);
    function CommunicationFailed() {
        return _super.call(this, "CommunicationFailed") || this;
    }
    return CommunicationFailed;
}(Event));
export { CommunicationFailed };
//# sourceMappingURL=events.js.map