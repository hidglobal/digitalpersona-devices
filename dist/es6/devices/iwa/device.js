import { MultiCastEventSource } from '../../private';
import { Command, Request, Channel } from '../websdk';
import { CommunicationFailed } from '../../common';
import { Method } from './messages';
/**
 * Integrated Windows Authentication API.
 * An instance of this class allows internet browsers to authenticate in DigitalPersona servers
 * using Integrated Windows Authentication.
 * The IWA API uses DigitalPersona WebSDK to communicate with Windwows operating system and extract
 * Windows account data for authentication.
 */
export class WindowsAuthClient extends MultiCastEventSource {
    /**
     * Constructs a new IWA API object.
     * @param options - options for the `WebSdk` channel.
     */
    constructor(options) {
        super();
        this.channel = new Channel("wia", options);
        this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
    }
    /**
     * Adds an event handler for the event.
     * This is a multicast subscription, i.e. many handlers can be registered at once.
     *
     * @param event - a name of the event to subscribe, e.g. "CommunicationFailed"
     * @param handler - an event handler.
     * @returns an event handler reference.
     * Store the reference and pass it to the {@link WindowsAuthClient.off} to unsubscribe from the event.
     *
     * @example
     * ```
     * class IntegratedWindowsAuthComponent
     * {
     *     private client: WindowsAuthClient;
     *
     *     private onCommunicationFailed = (event: CommunicationFailed) => { ... }
     *
     *     public $onInit() {
     *         this.client = new WindowsAuthClient();
     *         this.client.on("CommunicationFailed", this.onCommunicationFailed);
     *     }
     *     public $onDestroy() {
     *         this.client.off("CommunicationFailed", this.onCommunicationFailed);
     *         // alternatively, call this.reader.off() to unsubscribe from all events at once.
     *         delete this.client;
     *     }
     * }
     * ```
     */
    on(event, handler) { return this._on(event, handler); }
    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link WindowsAuthClient.on} method.
     */
    off(event, handler) { return this._off(event, handler); }
    /** Used internally. Do not call this method. */
    init() {
        return this.channel.send(new Request(new Command(Method.Init)), 3000)
            .then(response => {
            const data = JSON.parse(response.Data || "{}");
            return { handle: data.Handle, data: data.Data };
        });
    }
    /** Used internally. Do not call this method. */
    continue(handle, data) {
        return this.channel.send(new Request(new Command(Method.Continue, JSON.stringify({ Handle: handle, Data: data }))))
            .then(response => {
            const d = JSON.parse(response.Data || "{}");
            return d.Data;
        });
    }
    /** Used internally. Do not call this method. */
    term(handle) {
        return this.channel.send(new Request(new Command(Method.Term, JSON.stringify({ Handle: handle }))))
            .then();
    }
    /** Converts WebSdk connectivity error to an IWA API event. */
    onConnectionFailed() {
        this.emit(new CommunicationFailed());
    }
}
//# sourceMappingURL=device.js.map