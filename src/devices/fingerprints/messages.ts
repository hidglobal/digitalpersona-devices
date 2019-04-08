import { SampleFormat, QualityCode } from './sample';

export enum Method {
    EnumerateDevices = 1,
    GetDeviceInfo = 2,
    StartAcquisition = 3,
    StopAcquisition = 4
}

export enum NotificationType {
    Completed = 0,
    Error = 1,
    Disconnected = 2,
    Connected = 3,
    Quality = 4,
    Stopped = 10,
    Started = 11
}

export interface Response {
    Method: Method;
    Result: number;
    Data?: string;
}

export interface Notification {
    Event: NotificationType;
    Device: string;
    Data?: string;
}

export interface EnumerateDevicesResponse {
    DeviceCount: number;
    DeviceIDs: string;
}

export interface Completed {
    SampleFormat: SampleFormat;
    Samples: string;
}

export interface Error {
    uError: number;
}

export interface Quality {
    Quality: QualityCode;
}

