import { DeviceEvent } from '../events';
import { SampleFormat, QualityCode } from './sample';
import { BioSample } from '@digitalpersona/core';
/** An event signaling that a new fingerprint sample (or samples) was acquired during a scan. */
export declare class SamplesAcquired extends DeviceEvent {
    /** A fingerprint sample format. */
    sampleFormat: SampleFormat;
    /** A collection of fingerprint samples acquired. */
    samples: BioSample[];
    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param sampleFormat - a fingerprint sample format.
     * @param sampleData - raw sample data received with WebSdk notifiation.
     */
    constructor(deviceUid: string, sampleFormat: SampleFormat, sampleData: string);
}
/** An event reporting a quality of a fingerprint scan. */
export declare class QualityReported extends DeviceEvent {
    /** Fingerprint scan quality. */
    quality: QualityCode;
    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param quality - a fingerprint scan quality.
     */
    constructor(deviceUid: string, quality: QualityCode);
}
/** An event reporting a fingerprint reader error.  */
export declare class ErrorOccurred extends DeviceEvent {
    /** A fingerprint reader error. */
    error: number;
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     * @param error - an error code.
     */
    constructor(deviceUid: string, error: number);
}
/** An event signaling that a fingerprint reader is ready and waiting to scan a finger. */
export declare class AcquisitionStarted extends DeviceEvent {
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    constructor(deviceUid: string);
}
/** An event signaling that a fingerprint reader has stopped waiting for a finger scan. */
export declare class AcquisitionStopped extends DeviceEvent {
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    constructor(deviceUid: string);
}
