/**@internal
 *
 */
export var Method;
(function (Method) {
    Method[Method["EnumerateReaders"] = 1] = "EnumerateReaders";
    Method[Method["EnumerateCards"] = 2] = "EnumerateCards";
    Method[Method["GetCardInfo"] = 3] = "GetCardInfo";
    Method[Method["GetCardUID"] = 4] = "GetCardUID";
    Method[Method["GetDPCardAuthData"] = 5] = "GetDPCardAuthData";
    Method[Method["GetDPCardEnrollData"] = 6] = "GetDPCardEnrollData";
    Method[Method["Subscribe"] = 100] = "Subscribe";
    Method[Method["Unsubscribe"] = 101] = "Unsubscribe";
})(Method || (Method = {}));
/**@internal
 *
 */
export var NotificationType;
(function (NotificationType) {
    NotificationType[NotificationType["ReaderConnected"] = 1] = "ReaderConnected";
    NotificationType[NotificationType["ReaderDisconnected"] = 2] = "ReaderDisconnected";
    NotificationType[NotificationType["CardInserted"] = 3] = "CardInserted";
    NotificationType[NotificationType["CardRemoved"] = 4] = "CardRemoved";
})(NotificationType || (NotificationType = {}));
//# sourceMappingURL=messages.js.map