import { DeviceEvent } from '../events';
/**
 * An event signaling that a card was presented (inserted or touched) to a card reader.
 */
export declare class CardInserted extends DeviceEvent {
    /** A card ID */
    cardId: string;
    /** Contructs a new event object.
     * @param reader - a name of a card reader where the card was presented.
     * @param card - a name of a card presented.
     */
    constructor(reader: string, card: string);
}
/** An event signaling that a card was removed from a card reader. */
export declare class CardRemoved extends DeviceEvent {
    /** A card ID */
    cardId: string;
    /** Contructs a new event object.
     * @param reader - a name of a card reader where the card was presented.
     * @param card - a name of a card presented.
     */
    constructor(reader: string, card: string);
}
