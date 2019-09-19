import { __extends } from "tslib";
import { Event } from '../common';
/** A base class for device events.  */
var DeviceEvent = /** @class */ (function (_super) {
    __extends(DeviceEvent, _super);
    /** Constructs a new event.
     * @param type - an event type
     * @param deviceId - a device ID.
     */
    function DeviceEvent(type, deviceId) {
        var _this = _super.call(this, type) || this;
        _this.deviceId = deviceId;
        return _this;
    }
    return DeviceEvent;
}(Event));
export { DeviceEvent };
/** An event signaling that a device was connected. */
var DeviceConnected = /** @class */ (function (_super) {
    __extends(DeviceConnected, _super);
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    function DeviceConnected(deviceId) {
        return _super.call(this, "DeviceConnected", deviceId) || this;
    }
    return DeviceConnected;
}(DeviceEvent));
export { DeviceConnected };
/** An event signaling that a device was disconnected. */
var DeviceDisconnected = /** @class */ (function (_super) {
    __extends(DeviceDisconnected, _super);
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    function DeviceDisconnected(deviceId) {
        return _super.call(this, "DeviceDisconnected", deviceId) || this;
    }
    return DeviceDisconnected;
}(DeviceEvent));
export { DeviceDisconnected };
//# sourceMappingURL=events.js.map