/**
 * Fingerprint device types.
 */
export var DeviceUidType;
(function (DeviceUidType) {
    /** The fingerprint device is embedded and cannot be removed. */
    DeviceUidType[DeviceUidType["Persistent"] = 0] = "Persistent";
    /** The fingerprint device can be removed. */
    DeviceUidType[DeviceUidType["Volatile"] = 1] = "Volatile";
})(DeviceUidType || (DeviceUidType = {}));
/**
 * Fingerprint device modalities (how users should use they fingers to make a scan).
 */
export var DeviceModality;
(function (DeviceModality) {
    /** The fingerprint modality is not known. */
    DeviceModality[DeviceModality["Unknown"] = 0] = "Unknown";
    /** Users must swipe a single finger.  */
    DeviceModality[DeviceModality["Swipe"] = 1] = "Swipe";
    /** Users must place a single finger over a scaning area. */
    DeviceModality[DeviceModality["Area"] = 2] = "Area";
    /** Users must place multiple fingers over a scaning area. */
    DeviceModality[DeviceModality["AreaMultifinger"] = 3] = "AreaMultifinger";
})(DeviceModality || (DeviceModality = {}));
/** A fingerprint reader technology (a method of scanning)  */
export var DeviceTechnology;
(function (DeviceTechnology) {
    /** The method of scanning is unknown. */
    DeviceTechnology[DeviceTechnology["Unknown"] = 0] = "Unknown";
    /** The reader uses an optical image of a finger skin. */
    DeviceTechnology[DeviceTechnology["Optical"] = 1] = "Optical";
    /** The reader uses changes of electrical capacitance of a finger skin. */
    DeviceTechnology[DeviceTechnology["Capacitive"] = 2] = "Capacitive";
    /** The reader uses a thermal image of a finger.  */
    DeviceTechnology[DeviceTechnology["Thermal"] = 3] = "Thermal";
    /** The reader uses changes of a pressure under the finger. */
    DeviceTechnology[DeviceTechnology["Pressure"] = 4] = "Pressure";
})(DeviceTechnology || (DeviceTechnology = {}));
//# sourceMappingURL=device.js.map