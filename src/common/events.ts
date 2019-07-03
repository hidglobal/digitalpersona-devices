/**
 * A base class for DigitalPersona events.
 */
export class Event
{
    public type: string;

    constructor(type: string) {
        this.type = type;
    }
}

/**
 * An event signaling a problem with a device channel communication.
 */
export class CommunicationFailed extends Event
{
    constructor() {
        super("CommunicationFailed");
    }
}
