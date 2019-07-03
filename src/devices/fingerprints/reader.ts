import { Base64Url, Utf8 } from '@digitalpersona/core';
import { Handler, MultiCastEventSource } from '../../private';
import { Command, Request, Channel } from '../websdk';
import { CommunicationFailed, CommunicationEventSource } from '../../common';
import { DeviceConnected, DeviceDisconnected, DeviceEventSource } from '../events';
import { ErrorOccurred,
    SamplesAcquired, QualityReported,
    AcquisitionStarted, AcquisitionStopped,
} from './events';
import { FingerprintsEventSource } from './eventSource';
import {
    Method, NotificationType, Notification, EnumerateDevicesResponse,
    Completed, Error, Quality } from './messages';
import { DeviceInfo } from './device';
import { SampleFormat } from './sample';

/**
 * A fingerprint reader API.
 * An instance of this class allows to subscribe to finerprint reader events and read fingerprint data.
 * The fingerprint reader API uses DigitalPersona WebSDK to communicate with fingerprint reader drivers and hardware.
 */
export class FingerprintReader
    extends MultiCastEventSource
//    implements FingerprintsEventSource, DeviceEventSource, CommunicationEventSource
{
    /** A WebSdk channel. */
    private readonly channel: Channel;

    /**
     * Constructs a new fingerprint reader API object.
     * @param options - options for the `WebSdk` channel.
     */
    constructor(
        private readonly options?: WebSdk.WebChannelOptions,
    ) {
        super();
        this.channel = new Channel("fingerprints", this.options);
        this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
        this.channel.onNotification = this.processNotification.bind(this);
    }

    /** An event handler for the {@link DeviceConnected} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onDeviceConnected: Handler<DeviceConnected>;

    /** An event handler for the {@link DeviceDisconnected} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onDeviceDisconnected: Handler<DeviceDisconnected>;

    /** An event handler for the {@link SamplesAcquired} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onSamplesAcquired: Handler<SamplesAcquired>;

    /** An event handler for the {@link QualityReported} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onQualityReported: Handler<QualityReported>;

    /** An event handler for the {@link ErrorOccurred} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onErrorOccurred: Handler<ErrorOccurred>;

    /** An event handler for the {@link AcquisitionStarted} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onAcquisitionStarted: Handler<AcquisitionStarted>;

    /** An event handler for the {@link AcquisitionStopped} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onAcquisitionStopped: Handler<AcquisitionStopped>;

    /** An event handler for the {@link CommunicationFailed} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    public onCommunicationFailed: Handler<CommunicationFailed>;

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
    public on<E extends Event>(event: string, handler: Handler<E>): Handler<E> { return this._on(event, handler); }

    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link FingerprintReader.on} method.
     */
    public off<E extends Event>(event?: string, handler?: Handler<E>): this { return this._off(event, handler); }

    /** Lists all connected fingerprint readers.
     * @returns a promise to return a list of fingerprint reader names.
     */
    public enumerateDevices(): Promise<string[]> {
        return this.channel.send(new Request(new Command(
            Method.EnumerateDevices,
        )))
        .then(response => {
            if (!response) return [];
            const deviceList: EnumerateDevicesResponse = JSON.parse(Utf8.fromBase64Url(response.Data || "{}"));
            return JSON.parse(deviceList.DeviceIDs || "[]");
        });
    }

    /** Reads a fingerprint reader device information.
     * @param deviceUid - a fingerprint reader ID.
     * @returns a promise to return a device information.
     * The promise can be fulfilled but return `null` if the reader provides no information.
     * The promise will be rejected if a reader is not found or in case of a reading error.
     */
    public getDeviceInfo(deviceUid: string): Promise<DeviceInfo|null> {
        return this.channel.send(new Request(new Command(
            Method.GetDeviceInfo,
            Base64Url.fromJSON({ DeviceID: deviceUid }),
        )))
        .then(response => {
            const deviceInfo: DeviceInfo = JSON.parse(Utf8.fromBase64Url(response.Data || "null"));
            return deviceInfo;
        });
    }

    /** Activate a fingerprint acquisition mode.
     * This call will produce a {@link AcquisitionStarted} event if activation was successful.
     * After that the reader will wait for a finger placed on the reader.
     * When a finger is placed, a {@link QualityReported} event will report a scan quality,
     * and a {@link SamplesAcquired} event will return a scanned sample in case of a successful scan.
     */
    public startAcquisition(sampleFormat: SampleFormat, deviceUid?: string): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.StartAcquisition,
            Base64Url.fromJSON({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
                SampleType: sampleFormat,
            }),
        )))
        .then();
    }

    /** Deactivates a fingerprint acquisition mode.
     * This call will produce a {@link AcquisitionStopped} event if deactivation was successful.
     * After that the reader will stop waiting for a finger.
     */
    public stopAcquisition(deviceUid?: string): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.StopAcquisition,
            Base64Url.fromJSON({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
            }),
        )))
        .then();
    }

    /** Converts WebSdk connectivity error to a fingerprint API event. */
    private onConnectionFailed(): void {
        this.emit(new CommunicationFailed());
    }

    /** Converts WebSdk notification to fingerprint API events. */
    private processNotification(notification: Notification): void {
        switch (notification.Event) {
            case NotificationType.Completed:
                const completed: Completed = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new SamplesAcquired(notification.Device, completed.SampleFormat, completed.Samples));
            case NotificationType.Error:
                const error: Error = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new ErrorOccurred(notification.Device, error.uError));
            case NotificationType.Disconnected:
                return this.emit(new DeviceDisconnected(notification.Device));
            case NotificationType.Connected:
                return this.emit(new DeviceConnected(notification.Device));
            case NotificationType.Quality:
                const quality: Quality = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new QualityReported(notification.Device, quality.Quality));
            case NotificationType.Stopped :
                return this.emit(new AcquisitionStopped(notification.Device));
            case NotificationType.Started:
                return this.emit(new AcquisitionStarted(notification.Device));
            default:
                console.log(`Unknown notification: ${notification.Event}`);
        }
    }
}
