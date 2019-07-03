import { Handler, MultiCastEventSource } from '../../private';
import { Command, Request, Channel } from '../websdk';
import { Event, CommunicationFailed, CommunicationEventSource } from '../../common';
import { DeviceConnected, DeviceDisconnected, DeviceEventSource } from '../events';
import { CardInserted, CardRemoved } from './events';
import { CardsEventSource as CardsEventSource } from './eventSource';
import { Method, NotificationType, Notification, CardNotification, ReaderList, CardList } from "./messages";
import { Card } from './cards';
import { Utf8, Base64Url, Base64, Utf16 } from '@digitalpersona/core';

/**
 * A card reader API class.
 * An instance of this class allows to subscribe to card reader events and read card data.
 * The card reader API uses DigitalPersona WebSDK to communicate with card reader drivers and hardware.
 */
export class CardsReader
    extends MultiCastEventSource
//    implements CommunicationEventSource, DeviceEventSource, CardsEventSource
{
    /** A WebSdk channel. */
    private readonly channel: Channel;

    /**
     * Constructs a new card reader API object.
     * @param options - options for the `WebSdk` channel.
     */
    constructor(options?: WebSdk.WebChannelOptions) {
        super();
        this.channel = new Channel("smartcards", options);
        this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
        this.channel.onNotification = this.processNotification.bind(this);
    }

    /** An event handler for the {@link DeviceConnected} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    public onDeviceConnected: Handler<DeviceConnected>;

    /** An event handler for the {@link DeviceDisconnected} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    public onDeviceDisconnected: Handler<DeviceDisconnected>;

    /** An event handler for the {@link CardInserted} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    public onCardInserted: Handler<CardInserted>;

    /** An event handler for the {@link CardRemoved} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    public onCardRemoved: Handler<CardRemoved>;

    /** An event handler for the {@link CommunicationFailed} event.
     * This is a unicast subscription, i.e. only one handler can be registered at once.
     */
    public onCommunicationFailed: Handler<CommunicationFailed>;

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
    public on<E extends Event>(event: string, handler: Handler<E>): Handler<E> { return this._on(event, handler); }

    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link CardsReader.on} method.
     * @example See example in {@link CardsReader.on}
     */
    public off<E extends Event>(event?: string, handler?: Handler<E>): this { return this._off(event, handler); }

    /** Lists all connected card readers.
     * @returns a promise to return a list of card reader names.
     */
    public enumerateReaders(): Promise<string[]> {
        return this.channel.send(new Request(new Command(
            Method.EnumerateReaders,
        )))
        .then(response => {
            const list: ReaderList = JSON.parse(Utf8.fromBase64Url(response.Data || "{}"));
            return JSON.parse(list.Readers || "[]");
        });
    }

    /** Lists all inserted cards.
     * @returns a promise to return a list of card information for connected cards.
     */
    public enumerateCards(): Promise<Card[]> {
        return this.channel.send(new Request(new Command(
            Method.EnumerateCards,
        )))
        .then(response => {
            const list: CardList = JSON.parse(Utf8.fromBase64Url(response.Data || "{}"));
            const cards: string[] = JSON.parse(list.Cards || "[]");
            return cards.map(s => JSON.parse(Utf16.fromBase64Url(s)));
        });
    }

    /** Reads card data from a specific card.
     * @param reader - a name of a card reader where the card was presented.
     * @returns a promise to return a card information.
     * The promise can be fulfilled but return `null` if the card has no information.
     * The promise will be rejected if a card is not found or in case of a reading error.
     */
    public getCardInfo(reader: string): Promise<Card|null> {
        return this.channel.send(new Request(new Command(
            Method.GetCardInfo,
            Base64Url.fromJSON({ Reader: reader }),
        )))
        .then(response => {
            const cardInfo: Card = JSON.parse(Utf8.fromBase64Url(response.Data || "null"));
            return cardInfo;
        });
    }

    /** Reads a card unique identifier.
     * @param reader - a name of a card reader where the card was presented.
     * @returns a promise to return a card identifier.
     */
    public getCardUid(reader: string): Promise<string> {
        return this.channel.send(new Request(new Command(
            Method.GetCardUID,
            Base64Url.fromJSON({ Reader: reader }),
        )))
        .then(response => {
            const data = Base64.fromBase64Url(response.Data || "");
            return data;
        });
    }

    /** Reads card authentication data.
     * @param reader - a name of a card reader where the card was presented.
     * @param pin - an PIN code (for cards requiring a PIN).
     * @returns a promise to return card authentication data.
     * The card data is an opaque encoded string which should be sent to the server as is.
     */
    public getCardAuthData(reader: string, pin?: string): Promise<string> {
        return this.channel.send(new Request(new Command(
            Method.GetDPCardAuthData,
            Base64Url.fromJSON({ Reader: reader, PIN: pin || "" }),
        )))
        .then(response => {
            const data = JSON.parse(Utf8.fromBase64Url(response.Data || ""));
            return data;
        });
    }

    /** Reads card enrollment data.
     * @param reader - a name of a card reader where the card was presented.
     * @param pin - an PIN code (for cards requiring a PIN).
     * @returns a promise to return a card enrollment data.
     * The card data is an opaque encoded string which should be sent to the server as is.
     */
    public getCardEnrollData(reader: string, pin?: string): Promise<string> {
        return this.channel.send(new Request(new Command(
            Method.GetDPCardEnrollData,
            Base64Url.fromJSON({ Reader: reader, PIN: pin || "" }),
        )))
        .then(response => {
            const data = JSON.parse(Utf8.fromBase64Url(response.Data || ""));
            return data;
        });
    }

    /** Starts listening for card reader events.
     * @param reader - an optional name of a card reader to listen.
     * If no name is provided, the API will start listening all card readers.
     */
    public subscribe(reader?: string): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.Subscribe,
            reader ? Base64Url.fromJSON({ Reader: reader }) : "",
        )))
        .then();
    }

    /** Stop listening for card reader events.
     * @param reader - an optional name of a card reader to stop listening.
     * If no name is provided, the API will stop listening all card readers.
     */
    public unsubscribe(reader?: string): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.Unsubscribe,
            reader ? Base64Url.fromJSON({ Reader: reader }) : "",
        )))
        .then();
    }

    /** Converts WebSdk connectivity error to a card API event. */
    private onConnectionFailed(): void {
        this.emit(new CommunicationFailed());
    }

    /** Converts WebSdk notification to card API events. */
    private processNotification(notification: Notification): void {
        switch (notification.Event) {
            case NotificationType.ReaderConnected:
                return this.emit(new DeviceConnected(notification.Reader));
            case NotificationType.ReaderDisconnected:
                return this.emit(new DeviceDisconnected(notification.Reader));
            case NotificationType.CardInserted:
                return this.emit(new CardInserted(notification.Reader, (notification as CardNotification).Card));
            case NotificationType.CardRemoved:
                return this.emit(new CardRemoved(notification.Reader, (notification as CardNotification).Card));
            default:
                console.log(`Unknown notification: ${notification.Event}`);
        }
    }

}
