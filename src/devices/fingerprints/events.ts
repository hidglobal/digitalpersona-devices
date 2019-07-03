import { DeviceEvent } from '../events';
import { SampleFormat, QualityCode } from './sample';
import { BioSample } from '@digitalpersona/core';

/** An event signaling that a new fingerprint sample (or samples) was acquired during a scan. */
export class SamplesAcquired extends DeviceEvent
{
    /** A fingerprint sample format. */
    public sampleFormat: SampleFormat;
    /** A collection of fingerprint samples acquired. */
    public samples: BioSample[];

    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param sampleFormat - a fingerprint sample format.
     * @param sampleData - raw sample data received with WebSdk notifiation.
     */
    constructor(deviceUid: string, sampleFormat: SampleFormat, sampleData: string) {
        super("SamplesAcquired", deviceUid);
        this.sampleFormat = sampleFormat;
        this.samples = JSON.parse(sampleData) as BioSample[];
    }
}

/** An event reporting a quality of a fingerprint scan. */
export class QualityReported extends DeviceEvent
{
    /** Fingerprint scan quality. */
    public quality: QualityCode;

    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param quality - a fingerprint scan quality.
     */
    constructor(deviceUid: string, quality: QualityCode) {
        super("QualityReported", deviceUid);
        this.quality = quality;
    }
}

/** An event reporting a fingerprint reader error.  */
export class ErrorOccurred extends DeviceEvent
{
    /** A fingerprint reader error. */
    public error: number;

    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     * @param error - an error code.
     */
    constructor(deviceUid: string, error: number) {
        super("ErrorOccurred", deviceUid);
        this.error = error;
    }
}

/** An event signaling that a fingerprint reader is ready and waiting to scan a finger. */
export class AcquisitionStarted extends DeviceEvent
{
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    constructor(deviceUid: string) {
        super("AcquisitionStarted", deviceUid);
    }
}

/** An event signaling that a fingerprint reader has stopped waiting for a finger scan. */
export class AcquisitionStopped extends DeviceEvent
{
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    constructor(deviceUid: string) {
        super("AcquisitionStopped", deviceUid);
    }
}
