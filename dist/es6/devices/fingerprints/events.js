import { DeviceEvent } from '../events';
/** An event signaling that a new fingerprint sample (or samples) was acquired during a scan. */
export class SamplesAcquired extends DeviceEvent {
    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param sampleFormat - a fingerprint sample format.
     * @param sampleData - raw sample data received with WebSdk notifiation.
     */
    constructor(deviceUid, sampleFormat, sampleData) {
        super("SamplesAcquired", deviceUid);
        this.sampleFormat = sampleFormat;
        this.samples = JSON.parse(sampleData);
    }
}
/** An event reporting a quality of a fingerprint scan. */
export class QualityReported extends DeviceEvent {
    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param quality - a fingerprint scan quality.
     */
    constructor(deviceUid, quality) {
        super("QualityReported", deviceUid);
        this.quality = quality;
    }
}
/** An event reporting a fingerprint reader error.  */
export class ErrorOccurred extends DeviceEvent {
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     * @param error - an error code.
     */
    constructor(deviceUid, error) {
        super("ErrorOccurred", deviceUid);
        this.error = error;
    }
}
/** An event signaling that a fingerprint reader is ready and waiting to scan a finger. */
export class AcquisitionStarted extends DeviceEvent {
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    constructor(deviceUid) {
        super("AcquisitionStarted", deviceUid);
    }
}
/** An event signaling that a fingerprint reader has stopped waiting for a finger scan. */
export class AcquisitionStopped extends DeviceEvent {
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    constructor(deviceUid) {
        super("AcquisitionStopped", deviceUid);
    }
}
//# sourceMappingURL=events.js.map