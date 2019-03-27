import { Event } from 'common';
import { Handler } from 'private';

export class DeviceEvent extends Event
{
    public deviceId: string;

    constructor(type: string, deviceId: string) {
        super(type);
        this.deviceId = deviceId;
    }
}

export class DeviceConnected extends DeviceEvent
{
    constructor(deviceId: string) {
        super("DeviceConnected", deviceId);
    }
}

export class DeviceDisconnected extends DeviceEvent
{
    constructor(deviceId: string) {
        super("DeviceDisconnected", deviceId);
    }
}

export interface DeviceEventSource
{
    onDeviceConnected: Handler<DeviceConnected>;
    onDeviceDisconnected: Handler<DeviceDisconnected>;

    on(event: "DeviceConnected", handler: Handler<DeviceConnected>): this;
    on(event: "DeviceDisconnected", handler: Handler<DeviceDisconnected>): this;
}
