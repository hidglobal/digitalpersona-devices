/**
 * A base class for DigitalPersona events.
 */
export class Event {
    constructor(type) {
        this.type = type;
    }
}
/**
 * An event signaling a problem with a device channel communication.
 */
export class CommunicationFailed extends Event {
    constructor() {
        super("CommunicationFailed");
    }
}
//# sourceMappingURL=events.js.map