/// <reference types="WebSdk" />
import { Handler, MultiCastEventSource } from '../../private';
import { Event, CommunicationFailed } from '../../common';
import { DeviceConnected, DeviceDisconnected } from '../events';
import { CardInserted, CardRemoved } from './events';
import { Card } from './cards';
/**
 * A card reader API class.
 * An instance of this class allows to subscribe to card reader events and read card data.
 * The card reader API uses DigitalPersona WebSDK to communicate with card reader drivers and hardware.
 */
export declare class CardsReader extends MultiCastEventSource {
    /** A WebSdk channel. */
    private readonly channel;
    /**
     * Constructs a new card reader API object.
     * @param options - options for the `WebSdk` channel.
     */
    constructor(options?: WebSdk.WebChannelOptions);
    /** An event handler for the {@link DeviceConnected} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    onDeviceConnected: Handler<DeviceConnected>;
    /** An event handler for the {@link DeviceDisconnected} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    onDeviceDisconnected: Handler<DeviceDisconnected>;
    /** An event handler for the {@link CardInserted} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    onCardInserted: Handler<CardInserted>;
    /** An event handler for the {@link CardRemoved} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    onCardRemoved: Handler<CardRemoved>;
    /** An event handler for the {@link CommunicationFailed} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    onCommunicationFailed: Handler<CommunicationFailed>;
    /**
     * Adds an event handler for the event.
     * This is a multicast subscription, i.e. many handlers can be registered at once.
     *
     * @param event - a name of the event to subscribe, e.g. "CardInserted"
     * @param handler - an event handler.
     * @returns an event handler reference.
     * Store the reference and pass it to the {@link CardsReader.off} to unsubscribe from the event.
     *
     * @example
     * ```
     * class CardComponent
     * {
     *     private reader: CardsReader;
     *
     *     private onCardInserted = (event: CardInserted) => { ... }
     *     private onCardRemoved = (event: CardRemoved) => { ... }
     *     ...
     *
     *     public async $onInit() {
     *         this.reader = new CardsReader();
     *         this.reader.on("CardInserted", this.onCardInserted);
     *         this.reader.on("CardRemoved", this.onCardRemoved);
     *         ...
     *         await this.cardReader.subscribe()
     *     }
     *     public async $onDestroy() {
     *         await this.cardReader.unsubscribe();
     *         this.reader.off("CardInserted", this.onCardInserted);
     *         this.reader.off("CardRemoved", this.onCardRemoved);
     *         ...
     *         // alternatively, call this.reader.off() to unsubscribe from all events at once.
     *         delete this.reader;
     *     }
     * }
     * ```
     */
    on<E extends Event>(event: string, handler: Handler<E>): Handler<E>;
    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link CardsReader.on} method.
     * @example See example in {@link CardsReader.on}
     */
    off<E extends Event>(event?: string, handler?: Handler<E>): this;
    /** Lists all connected card readers.
     * @returns a promise to return a list of card reader names.
     */
    enumerateReaders(): Promise<string[]>;
    /** Lists all inserted cards.
     * @returns a promise to return a list of card information for connected cards.
     */
    enumerateCards(): Promise<Card[]>;
    /** Reads card data from a specific card.
     * @param reader - a name of a card reader where the card was presented.
     * @returns a promise to return a card information.
     * The promise can be fulfilled but return `null` if the card has no information.
     * The promise will be rejected if a card is not found or in case of a reading error.
     */
    getCardInfo(reader: string): Promise<Card | null>;
    /** Reads a card unique identifier.
     * @param reader - a name of a card reader where the card was presented.
     * @returns a promise to return a card identifier.
     */
    getCardUid(reader: string): Promise<string>;
    /** Reads card authentication data.
     * @param reader - a name of a card reader where the card was presented.
     * @param pin - an PIN code (for cards requiring a PIN).
     * @returns a promise to return card authentication data.
     * The card data is an opaque encoded string which should be sent to the server as is.
     */
    getCardAuthData(reader: string, pin?: string): Promise<string>;
    /** Reads card enrollment data.
     * @param reader - a name of a card reader where the card was presented.
     * @param pin - an PIN code (for cards requiring a PIN).
     * @returns a promise to return a card enrollment data.
     * The card data is an opaque encoded string which should be sent to the server as is.
     */
    getCardEnrollData(reader: string, pin?: string): Promise<string>;
    /** Starts listening for card reader events.
     * @param reader - an optional name of a card reader to listen.
     * If no name is provided, the API will start listening all card readers.
     */
    subscribe(reader?: string): Promise<void>;
    /** Stop listening for card reader events.
     * @param reader - an optional name of a card reader to stop listening.
     * If no name is provided, the API will stop listening all card readers.
     */
    unsubscribe(reader?: string): Promise<void>;
    /** Converts WebSdk connectivity error to a card API event. */
    private onConnectionFailed;
    /** Converts WebSdk notification to card API events. */
    private processNotification;
}
