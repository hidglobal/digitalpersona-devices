import { SampleFormat, QualityCode } from './sample';
/**@internal
 *
 */
export declare enum Method {
    EnumerateDevices = 1,
    GetDeviceInfo = 2,
    StartAcquisition = 3,
    StopAcquisition = 4
}
/**@internal
 *
 */
export declare enum NotificationType {
    Completed = 0,
    Error = 1,
    Disconnected = 2,
    Connected = 3,
    Quality = 4,
    Stopped = 10,
    Started = 11
}
/**@internal
 *
 */
export interface Response {
    Method: Method;
    Result: number;
    Data?: string;
}
/**@internal
 *
 */
export interface Notification {
    Event: NotificationType;
    Device: string;
    Data?: string;
}
/**@internal
 *
 */
export interface EnumerateDevicesResponse {
    DeviceCount: number;
    DeviceIDs: string;
}
/**@internal
 *
 */
export interface Completed {
    SampleFormat: SampleFormat;
    Samples: string;
}
/**@internal
 *
 */
export interface Error {
    uError: number;
}
/**@internal
 *
 */
export interface Quality {
    Quality: QualityCode;
}
