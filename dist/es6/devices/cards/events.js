import { DeviceEvent } from '../events';
/**
 * An event signaling that a card was presented (inserted or touched) to a card reader.
 */
export class CardInserted extends DeviceEvent {
    /** Contructs a new event object.
     * @param reader - a name of a card reader where the card was presented.
     * @param card - a name of a card presented.
     */
    constructor(reader, card) {
        super("CardInserted", reader);
        this.cardId = card;
    }
}
/** An event signaling that a card was removed from a card reader. */
export class CardRemoved extends DeviceEvent {
    /** Contructs a new event object.
     * @param reader - a name of a card reader where the card was presented.
     * @param card - a name of a card presented.
     */
    constructor(reader, card) {
        super("CardRemoved", reader);
        this.cardId = card;
    }
}
//# sourceMappingURL=events.js.map