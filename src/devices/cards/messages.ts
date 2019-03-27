export enum Method {
    EnumerateReaders = 1,
    EnumerateCards = 2,
    GetCardInfo = 3,
    GetCardUID = 4,
    GetDPCardAuthData = 5,
    GetDPCardEnrollData = 6,
    Subscribe = 100,
    Unsubscribe = 101
}

export enum NotificationType {
    ReaderConnected = 1,
    ReaderDisconnected = 2,
    CardInserted = 3,
    CardRemoved = 4
}

export interface Notification {
    Event: NotificationType;
    Reader: string;
}

export interface CardNotification extends Notification {
    Event: NotificationType.CardInserted | NotificationType.CardRemoved;
    Reader: string;
    Card: string;
}

export interface ReaderList {
    ReadersCount: number;
    Readers: string;
}

export interface CardList {
    CardsCount: number;
    Cards: string;
}
