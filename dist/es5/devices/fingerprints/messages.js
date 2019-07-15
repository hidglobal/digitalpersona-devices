/**@internal
 *
 */
export var Method;
(function (Method) {
    Method[Method["EnumerateDevices"] = 1] = "EnumerateDevices";
    Method[Method["GetDeviceInfo"] = 2] = "GetDeviceInfo";
    Method[Method["StartAcquisition"] = 3] = "StartAcquisition";
    Method[Method["StopAcquisition"] = 4] = "StopAcquisition";
})(Method || (Method = {}));
/**@internal
 *
 */
export var NotificationType;
(function (NotificationType) {
    NotificationType[NotificationType["Completed"] = 0] = "Completed";
    NotificationType[NotificationType["Error"] = 1] = "Error";
    NotificationType[NotificationType["Disconnected"] = 2] = "Disconnected";
    NotificationType[NotificationType["Connected"] = 3] = "Connected";
    NotificationType[NotificationType["Quality"] = 4] = "Quality";
    NotificationType[NotificationType["Stopped"] = 10] = "Stopped";
    NotificationType[NotificationType["Started"] = 11] = "Started";
})(NotificationType || (NotificationType = {}));
//# sourceMappingURL=messages.js.map