/** Enumerates supported card types. */
export declare enum CardType {
    /** A smartcard. */
    Contact = 1,
    /** A contactless card. */
    Contactless = 2,
    /** A proximity card. */
    Proximity = 4
}
/** Bitwise flags for attributes supported by a card. */
export declare enum CardAttributes {
    /** The card supports PIN code. */
    SupportsPIN = 1,
    /** The card supports UID. */
    SupportsUID = 2,
    /** The card supports PKI. */
    IsPKI = 65536,
    /** The card supports PIV. */
    IsPIV = 131072,
    /** The card is read-only. */
    IsReadOnly = 2147483648
}
/** A card information. */
export interface Card {
    /** A card name. */
    readonly Name: string;
    /** A card reader name. */
    readonly Reader: string;
    /** A card type. */
    readonly Type: CardType;
    /** Attributes supported by the card. */
    readonly Attributes: CardAttributes;
}
