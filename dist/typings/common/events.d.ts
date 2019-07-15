/**
 * A base class for DigitalPersona events.
 */
export declare class Event {
    type: string;
    constructor(type: string);
}
/**
 * An event signaling a problem with a device channel communication.
 */
export declare class CommunicationFailed extends Event {
    constructor();
}
