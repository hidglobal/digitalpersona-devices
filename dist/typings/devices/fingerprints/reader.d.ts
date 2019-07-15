/// <reference types="WebSdk" />
import { Handler, MultiCastEventSource } from '../../private';
import { CommunicationFailed } from '../../common';
import { DeviceConnected, DeviceDisconnected } from '../events';
import { ErrorOccurred, SamplesAcquired, QualityReported, AcquisitionStarted, AcquisitionStopped } from './events';
import { DeviceInfo } from './device';
import { SampleFormat } from './sample';
/**
 * A fingerprint reader API.
 * An instance of this class allows to subscribe to finerprint reader events and read fingerprint data.
 * The fingerprint reader API uses DigitalPersona WebSDK to communicate with fingerprint reader drivers and hardware.
 */
export declare class FingerprintReader extends MultiCastEventSource {
    private readonly options?;
    /** A WebSdk channel. */
    private readonly channel;
    /**
     * Constructs a new fingerprint reader API object.
     * @param options - options for the `WebSdk` channel.
     */
    constructor(options?: WebSdk.WebChannelOptions | undefined);
    /** An event handler for the {@link DeviceConnected} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onDeviceConnected: Handler<DeviceConnected>;
    /** An event handler for the {@link DeviceDisconnected} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onDeviceDisconnected: Handler<DeviceDisconnected>;
    /** An event handler for the {@link SamplesAcquired} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onSamplesAcquired: Handler<SamplesAcquired>;
    /** An event handler for the {@link QualityReported} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onQualityReported: Handler<QualityReported>;
    /** An event handler for the {@link ErrorOccurred} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onErrorOccurred: Handler<ErrorOccurred>;
    /** An event handler for the {@link AcquisitionStarted} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onAcquisitionStarted: Handler<AcquisitionStarted>;
    /** An event handler for the {@link AcquisitionStopped} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onAcquisitionStopped: Handler<AcquisitionStopped>;
    /** An event handler for the {@link CommunicationFailed} event.
     * @remarks This is a unicast subscription, i.e. only one handler can be registered at once.
     * For multicast subscription use {@link FingerprintReader.on} and {@link FingerprintReader.off}.
     */
    onCommunicationFailed: Handler<CommunicationFailed>;
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
    on<E extends Event>(event: string, handler: Handler<E>): Handler<E>;
    /** Deletes an event handler for the event.
     * @param event - a name of the event to subscribe.
     * @param handler - an event handler added with the {@link FingerprintReader.on} method.
     */
    off<E extends Event>(event?: string, handler?: Handler<E>): this;
    /** Lists all connected fingerprint readers.
     * @returns a promise to return a list of fingerprint reader names.
     */
    enumerateDevices(): Promise<string[]>;
    /** Reads a fingerprint reader device information.
     * @param deviceUid - a fingerprint reader ID.
     * @returns a promise to return a device information.
     * The promise can be fulfilled but return `null` if the reader provides no information.
     * The promise will be rejected if a reader is not found or in case of a reading error.
     */
    getDeviceInfo(deviceUid: string): Promise<DeviceInfo | null>;
    /** Activate a fingerprint acquisition mode.
     * This call will produce a {@link AcquisitionStarted} event if activation was successful.
     * After that the reader will wait for a finger placed on the reader.
     * When a finger is placed, a {@link QualityReported} event will report a scan quality,
     * and a {@link SamplesAcquired} event will return a scanned sample in case of a successful scan.
     */
    startAcquisition(sampleFormat: SampleFormat, deviceUid?: string): Promise<void>;
    /** Deactivates a fingerprint acquisition mode.
     * This call will produce a {@link AcquisitionStopped} event if deactivation was successful.
     * After that the reader will stop waiting for a finger.
     */
    stopAcquisition(deviceUid?: string): Promise<void>;
    /** Converts WebSdk connectivity error to a fingerprint API event. */
    private onConnectionFailed;
    /** Converts WebSdk notification to fingerprint API events. */
    private processNotification;
}
