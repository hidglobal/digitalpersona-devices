/**@internal
 *
 */
export enum MessageType {
    Response = 0,
    Notification = 1,
}

/**@internal
 *
 */
export interface Message {
    Type: MessageType;
    Data: string;
}
