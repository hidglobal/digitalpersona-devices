export enum Method {
    Init = 1,
    Continue = 2,
    Term = 3,
    Authenticate = 4
}

export enum MessageType {
    Response = 0,
    Notification = 1
}

export interface Response {
    Method: Method;
    Result: number;
    Data?: string;
}

export interface Message {
    Type: MessageType;
    Data: string;
}

