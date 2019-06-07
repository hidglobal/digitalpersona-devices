/**@internal
 *
 */
export enum Method {
    Init = 1,
    Continue = 2,
    Term = 3,
    Authenticate = 4,
}

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
export interface Response {
    Method: Method;
    Result: number;
    Data?: string;
}

/**@internal
 *
 */
export interface Message {
    Type: MessageType;
    Data: string;
}
