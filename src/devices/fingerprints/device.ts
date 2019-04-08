export enum DeviceUidType {
    Persistent = 0,
    Volatile = 1
}

export enum DeviceModality {
    Unknown = 0,
    Swipe = 1,
    Area = 2,
    AreaMultifinger = 3
}

export enum DeviceTechnology {
    Unknown = 0,
    Optical = 1,
    Capacitive = 2,
    Thermal = 3,
    Pressure = 4
}

export interface DeviceInfo {
    readonly DeviceID: string;
    readonly eUidType: DeviceUidType;
    readonly eDeviceModality: DeviceModality;
    readonly eDeviceTech: DeviceTechnology;
}
