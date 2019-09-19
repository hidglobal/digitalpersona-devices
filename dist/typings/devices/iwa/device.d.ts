/// <reference types="WebSdk" />
import { Base64UrlString } from '@digitalpersona/core';
import { AuthenticationData, IAuthenticationClient, AuthenticationHandle } from '@digitalpersona/services';
import { Handler, MultiCastEventSource } from '../../private';
import { CommunicationFailed } from '../../common';
/**
 * Integrated Windows Authentication API.
 * An instance of this class allows internet browsers to authenticate in DigitalPersona servers
 * using Integrated Windows Authentication.
 * The IWA API uses DigitalPersona WebSDK to communicate with Windwows operating system and extract
 * Windows account data for authentication.
 */
export declare class WindowsAuthClient extends MultiCastEventSource implements IAuthenticationClient {
    /** A WebSdk channel. */
    private channel;
    /**
     * Constructs a new IWA API object.
     * @param options - options for the `WebSdk` channel.
     */
    constructor(options?: WebSdk.WebChannelOptions);
    /** A uni-cast event handler for the {@link CommunicationFailed} event. */
    onCommunicationFailed: Handler<CommunicationFailed>;
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
    on<E extends Event>(event: string, handler: Handler<E>): Handler<E>;
    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link WindowsAuthClient.on} method.
     */
    off<E extends Event>(event?: string, handler?: Handler<E>): this;
    /** Used internally. Do not call this method. */
    init(): Promise<AuthenticationData>;
    /** Used internally. Do not call this method. */
    continue(handle: AuthenticationHandle, data: string): Promise<Base64UrlString>;
    /** Used internally. Do not call this method. */
    term(handle: AuthenticationHandle): Promise<void>;
    /** Converts WebSdk connectivity error to an IWA API event. */
    private onConnectionFailed;
}
