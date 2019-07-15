import { Event } from '../common';
import { Handler } from '../private';
/** A base class for device events.  */
export declare class DeviceEvent extends Event {
    /** A device ID.  */
    deviceId: string;
    /** Constructs a new event.
     * @param type - an event type
     * @param deviceId - a device ID.
     */
    constructor(type: string, deviceId: string);
}
/** An event signaling that a device was connected. */
export declare class DeviceConnected extends DeviceEvent {
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    constructor(deviceId: string);
}
/** An event signaling that a device was disconnected. */
export declare class DeviceDisconnected extends DeviceEvent {
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    constructor(deviceId: string);
}
/** @internal
 * A device event source.
 */
export interface DeviceEventSource {
    onDeviceConnected: Handler<DeviceConnected>;
    onDeviceDisconnected: Handler<DeviceDisconnected>;
    on(event: "DeviceConnected", handler: Handler<DeviceConnected>): Handler<DeviceConnected>;
    on(event: "DeviceDisconnected", handler: Handler<DeviceDisconnected>): Handler<DeviceDisconnected>;
}
