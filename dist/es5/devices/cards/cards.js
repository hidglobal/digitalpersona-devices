/** Enumerates supported card types. */
export var CardType;
(function (CardType) {
    /** A smartcard. */
    CardType[CardType["Contact"] = 1] = "Contact";
    /** A contactless card. */
    CardType[CardType["Contactless"] = 2] = "Contactless";
    /** A proximity card. */
    CardType[CardType["Proximity"] = 4] = "Proximity";
})(CardType || (CardType = {}));
/** Bitwise flags for attributes supported by a card. */
export var CardAttributes;
(function (CardAttributes) {
    /** The card supports PIN code. */
    CardAttributes[CardAttributes["SupportsPIN"] = 1] = "SupportsPIN";
    /** The card supports UID. */
    CardAttributes[CardAttributes["SupportsUID"] = 2] = "SupportsUID";
    /** The card supports PKI. */
    CardAttributes[CardAttributes["IsPKI"] = 65536] = "IsPKI";
    /** The card supports PIV. */
    CardAttributes[CardAttributes["IsPIV"] = 131072] = "IsPIV";
    /** The card is read-only. */
    CardAttributes[CardAttributes["IsReadOnly"] = 2147483648] = "IsReadOnly";
})(CardAttributes || (CardAttributes = {}));
//# sourceMappingURL=cards.js.map