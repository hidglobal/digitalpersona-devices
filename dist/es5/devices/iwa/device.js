import { __extends } from "tslib";
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
var WindowsAuthClient = /** @class */ (function (_super) {
    __extends(WindowsAuthClient, _super);
    /**
     * Constructs a new IWA API object.
     * @param options - options for the `WebSdk` channel.
     */
    function WindowsAuthClient(options) {
        var _this = _super.call(this) || this;
        _this.channel = new Channel("wia", options);
        _this.channel.onCommunicationError = _this.onConnectionFailed.bind(_this);
        return _this;
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
    WindowsAuthClient.prototype.on = function (event, handler) { return this._on(event, handler); };
    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link WindowsAuthClient.on} method.
     */
    WindowsAuthClient.prototype.off = function (event, handler) { return this._off(event, handler); };
    /** Used internally. Do not call this method. */
    WindowsAuthClient.prototype.init = function () {
        return this.channel.send(new Request(new Command(Method.Init)), 3000)
            .then(function (response) {
            var data = JSON.parse(response.Data || "{}");
            return { handle: data.Handle, data: data.Data };
        });
    };
    /** Used internally. Do not call this method. */
    WindowsAuthClient.prototype.continue = function (handle, data) {
        return this.channel.send(new Request(new Command(Method.Continue, JSON.stringify({ Handle: handle, Data: data }))))
            .then(function (response) {
            var d = JSON.parse(response.Data || "{}");
            return d.Data;
        });
    };
    /** Used internally. Do not call this method. */
    WindowsAuthClient.prototype.term = function (handle) {
        return this.channel.send(new Request(new Command(Method.Term, JSON.stringify({ Handle: handle }))))
            .then();
    };
    /** Converts WebSdk connectivity error to an IWA API event. */
    WindowsAuthClient.prototype.onConnectionFailed = function () {
        this.emit(new CommunicationFailed());
    };
    return WindowsAuthClient;
}(MultiCastEventSource));
export { WindowsAuthClient };
//# sourceMappingURL=device.js.map