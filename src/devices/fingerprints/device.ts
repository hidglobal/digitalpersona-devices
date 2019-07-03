/**
 * Fingerprint device types.
 */
export enum DeviceUidType {
    /** The fingerprint device is embedded and cannot be removed. */
    Persistent = 0,
    /** The fingerprint device can be removed. */
    Volatile = 1,
}

/**
 * Fingerprint device modalities (how users should use they fingers to make a scan).
 */
export enum DeviceModality {
    /** The fingerprint modality is not known. */
    Unknown = 0,
    /** Users must swipe a single finger.  */
    Swipe = 1,
    /** Users must place a single finger over a scaning area. */
    Area = 2,
    /** Users must place multiple fingers over a scaning area. */
    AreaMultifinger = 3,
}

/** A fingerprint reader technology (a method of scanning)  */
export enum DeviceTechnology {
    /** The method of scanning is unknown. */
    Unknown = 0,
    /** The reader uses an optical image of a finger skin. */
    Optical = 1,
    /** The reader uses changes of electrical capacitance of a finger skin. */
    Capacitive = 2,
    /** The reader uses a thermal image of a finger.  */
    Thermal = 3,
    /** The reader uses changes of a pressure under the finger. */
    Pressure = 4,
}

/** Fingerprint device information. */
export interface DeviceInfo {
    /** A fingerprint reader ID. */
    readonly DeviceID: string;
    /** A fingerprint reader type. */
    readonly eUidType: DeviceUidType;
    /** A fingerprint reader modality. */
    readonly eDeviceModality: DeviceModality;
    /** A fingerprint reader technology. */
    readonly eDeviceTech: DeviceTechnology;
}
