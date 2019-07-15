import { Event } from '../common';
/** A base class for device events.  */
export class DeviceEvent extends Event {
    /** Constructs a new event.
     * @param type - an event type
     * @param deviceId - a device ID.
     */
    constructor(type, deviceId) {
        super(type);
        this.deviceId = deviceId;
    }
}
/** An event signaling that a device was connected. */
export class DeviceConnected extends DeviceEvent {
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    constructor(deviceId) {
        super("DeviceConnected", deviceId);
    }
}
/** An event signaling that a device was disconnected. */
export class DeviceDisconnected extends DeviceEvent {
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    constructor(deviceId) {
        super("DeviceDisconnected", deviceId);
    }
}
//# sourceMappingURL=events.js.map