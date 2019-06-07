/**@internal
 *
 */
export enum Method {
    EnumerateReaders = 1,
    EnumerateCards = 2,
    GetCardInfo = 3,
    GetCardUID = 4,
    GetDPCardAuthData = 5,
    GetDPCardEnrollData = 6,
    Subscribe = 100,
    Unsubscribe = 101,
}

/**@internal
 *
 */
export enum NotificationType {
    ReaderConnected = 1,
    ReaderDisconnected = 2,
    CardInserted = 3,
    CardRemoved = 4,
}

/**@internal
 *
 */
export interface Notification {
    Event: NotificationType;
    Reader: string;
}

export interface CardNotification extends Notification {
/**@internal
 *
 */
Event: NotificationType.CardInserted | NotificationType.CardRemoved;
    Reader: string;
    Card: string;
}

/**@internal
 *
 */
export interface ReaderList {
    ReadersCount: number;
    Readers: string;
}

/**@internal
 *
 */
export interface CardList {
    CardsCount: number;
    Cards: string;
}
