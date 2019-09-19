import { __extends } from "tslib";
import { Base64Url, Utf8 } from '@digitalpersona/core';
import { MultiCastEventSource } from '../../private';
import { Command, Request, Channel } from '../websdk';
import { CommunicationFailed } from '../../common';
import { DeviceConnected, DeviceDisconnected } from '../events';
import { ErrorOccurred, SamplesAcquired, QualityReported, AcquisitionStarted, AcquisitionStopped, } from './events';
import { Method, NotificationType } from './messages';
/**
 * A fingerprint reader API.
 * An instance of this class allows to subscribe to finerprint reader events and read fingerprint data.
 * The fingerprint reader API uses DigitalPersona WebSDK to communicate with fingerprint reader drivers and hardware.
 */
var FingerprintReader = /** @class */ (function (_super) {
    __extends(FingerprintReader, _super);
    /**
     * Constructs a new fingerprint reader API object.
     * @param options - options for the `WebSdk` channel.
     */
    function FingerprintReader(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.channel = new Channel("fingerprints", _this.options);
        _this.channel.onCommunicationError = _this.onConnectionFailed.bind(_this);
        _this.channel.onNotification = _this.processNotification.bind(_this);
        return _this;
    }
    /**
     * Adds an event handler for the event.
     * This is a multicast subscription, i.e. many handlers can be registered at once.
     *
     * @param event - a name of the event to subscribe, e.g. "SampleAcquired"
     * @param handler - an event handler.
     * @returns an event handler reference.
     * Store the reference and pass it to the {@link FingerprintReader.off} to unsubscribe from the event.
     *
     * @example
     * ```
     * class FingerprintComponent
     * {
     *     private reader: FingerprintReader;
     *
     *     private onDeviceConnected = (event: DeviceConnected) => { ... };
     *     private onDeviceDisconnected = (event: DeviceDisconnected) => { ... };
     *     private onSamplesAcquired = (event: SampleAquired) => { ... };
     *     ...
     *
     *     public async $onInit() {
     *         this.reader = new FingerprintReader();
     *         this.reader.on("DeviceConnected", onDeviceConnected);
     *         this.reader.on("DeviceDisconnected", onDeviceDisconnected);
     *         this.reader.on("SamplesAcquired", onSamplesAcquired);
     *         ...
     *         await this.fingerprintReader.startAcquisition(SampleFormat.Intermediate);
     *     }
     *     public async $onDestroy() {
     *         await this.fingerprintReader.stopAcquisition();
     *         this.reader.off("DeviceConnected", onDeviceConnected);
     *         this.reader.off("DeviceDisconnected", onDeviceDisconnected);
     *         this.reader.off("SamplesAcquired", onSamplesAcquired);
     *         ...
     *         // alternatively, call this.reader.off() to unsubscribe from all events at once.
     *         delete this.reader;
     *     }
     * }
     * ```
     */
    FingerprintReader.prototype.on = function (event, handler) { return this._on(event, handler); };
    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link FingerprintReader.on} method.
     */
    FingerprintReader.prototype.off = function (event, handler) { return this._off(event, handler); };
    /** Lists all connected fingerprint readers.
     * @returns a promise to return a list of fingerprint reader names.
     */
    FingerprintReader.prototype.enumerateDevices = function () {
        return this.channel.send(new Request(new Command(Method.EnumerateDevices)))
            .then(function (response) {
            if (!response)
                return [];
            var deviceList = JSON.parse(Utf8.fromBase64Url(response.Data || "{}"));
            return JSON.parse(deviceList.DeviceIDs || "[]");
        });
    };
    /** Reads a fingerprint reader device information.
     * @param deviceUid - a fingerprint reader ID.
     * @returns a promise to return a device information.
     * The promise can be fulfilled but return `null` if the reader provides no information.
     * The promise will be rejected if a reader is not found or in case of a reading error.
     */
    FingerprintReader.prototype.getDeviceInfo = function (deviceUid) {
        return this.channel.send(new Request(new Command(Method.GetDeviceInfo, Base64Url.fromJSON({ DeviceID: deviceUid }))))
            .then(function (response) {
            var deviceInfo = JSON.parse(Utf8.fromBase64Url(response.Data || "null"));
            return deviceInfo;
        });
    };
    /** Activate a fingerprint acquisition mode.
     * This call will produce a {@link AcquisitionStarted} event if activation was successful.
     * After that the reader will wait for a finger placed on the reader.
     * When a finger is placed, a {@link QualityReported} event will report a scan quality,
     * and a {@link SamplesAcquired} event will return a scanned sample in case of a successful scan.
     */
    FingerprintReader.prototype.startAcquisition = function (sampleFormat, deviceUid) {
        return this.channel.send(new Request(new Command(Method.StartAcquisition, Base64Url.fromJSON({
            DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
            SampleType: sampleFormat,
        }))))
            .then();
    };
    /** Deactivates a fingerprint acquisition mode.
     * This call will produce a {@link AcquisitionStopped} event if deactivation was successful.
     * After that the reader will stop waiting for a finger.
     */
    FingerprintReader.prototype.stopAcquisition = function (deviceUid) {
        return this.channel.send(new Request(new Command(Method.StopAcquisition, Base64Url.fromJSON({
            DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
        }))))
            .then();
    };
    /** Converts WebSdk connectivity error to a fingerprint API event. */
    FingerprintReader.prototype.onConnectionFailed = function () {
        this.emit(new CommunicationFailed());
    };
    /** Converts WebSdk notification to fingerprint API events. */
    FingerprintReader.prototype.processNotification = function (notification) {
        switch (notification.Event) {
            case NotificationType.Completed:
                var completed = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new SamplesAcquired(notification.Device, completed.SampleFormat, completed.Samples));
            case NotificationType.Error:
                var error = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new ErrorOccurred(notification.Device, error.uError));
            case NotificationType.Disconnected:
                return this.emit(new DeviceDisconnected(notification.Device));
            case NotificationType.Connected:
                return this.emit(new DeviceConnected(notification.Device));
            case NotificationType.Quality:
                var quality = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new QualityReported(notification.Device, quality.Quality));
            case NotificationType.Stopped:
                return this.emit(new AcquisitionStopped(notification.Device));
            case NotificationType.Started:
                return this.emit(new AcquisitionStarted(notification.Device));
            default:
                console.log("Unknown notification: " + notification.Event);
        }
    };
    return FingerprintReader;
}(MultiCastEventSource
//    implements FingerprintsEventSource, DeviceEventSource, CommunicationEventSource
));
export { FingerprintReader };
//# sourceMappingURL=reader.js.map