export enum MessageType {
    Response = 0,
    Notification = 1
}

export interface Message {
    Type: MessageType;
    Data: string;
}
