export enum CardType {
    Contact = 1,
    Contactless = 2,
    Proximity = 4
}

export enum CardAttributes {
    SupportsPIN = 1,
    SupportsUID = 2,
    IsPKI = 0x00010000,
    IsPIV = 0x00020000,
    IsReadOnly = 0x80000000
}

export interface CardInfo {
    readonly Name: string;
    readonly Reader: string;
    readonly Type: CardType;
    readonly Attributes: CardAttributes;
}
