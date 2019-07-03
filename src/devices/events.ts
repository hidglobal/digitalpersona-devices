import { Event } from '../common';
import { Handler } from '../private';

/** A base class for device events.  */
export class DeviceEvent extends Event
{
    /** A device ID.  */
    public deviceId: string;

    /** Constructs a new event.
     * @param type - an event type
     * @param deviceId - a device ID.
     */
    constructor(type: string, deviceId: string) {
        super(type);
        this.deviceId = deviceId;
    }
}

/** An event signaling that a device was connected. */
export class DeviceConnected extends DeviceEvent
{
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    constructor(deviceId: string) {
        super("DeviceConnected", deviceId);
    }
}

/** An event signaling that a device was disconnected. */
export class DeviceDisconnected extends DeviceEvent
{
    /** Constructs a new event.
     * @param deviceId - a device ID.
     */
    constructor(deviceId: string) {
        super("DeviceDisconnected", deviceId);
    }
}

/** @internal
 * A device event source.
 */
export interface DeviceEventSource
{
    onDeviceConnected: Handler<DeviceConnected>;
    onDeviceDisconnected: Handler<DeviceDisconnected>;

    on(event: "DeviceConnected", handler: Handler<DeviceConnected>): Handler<DeviceConnected>;
    on(event: "DeviceDisconnected", handler: Handler<DeviceDisconnected>): Handler<DeviceDisconnected>;
}
