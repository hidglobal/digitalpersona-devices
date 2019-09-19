import { __extends } from "tslib";
import { DeviceEvent } from '../events';
/** An event signaling that a new fingerprint sample (or samples) was acquired during a scan. */
var SamplesAcquired = /** @class */ (function (_super) {
    __extends(SamplesAcquired, _super);
    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param sampleFormat - a fingerprint sample format.
     * @param sampleData - raw sample data received with WebSdk notifiation.
     */
    function SamplesAcquired(deviceUid, sampleFormat, sampleData) {
        var _this = _super.call(this, "SamplesAcquired", deviceUid) || this;
        _this.sampleFormat = sampleFormat;
        _this.samples = JSON.parse(sampleData);
        return _this;
    }
    return SamplesAcquired;
}(DeviceEvent));
export { SamplesAcquired };
/** An event reporting a quality of a fingerprint scan. */
var QualityReported = /** @class */ (function (_super) {
    __extends(QualityReported, _super);
    /** Constructs a new event object.
     * @param deviceUid - a fingerprint reader ID.
     * @param quality - a fingerprint scan quality.
     */
    function QualityReported(deviceUid, quality) {
        var _this = _super.call(this, "QualityReported", deviceUid) || this;
        _this.quality = quality;
        return _this;
    }
    return QualityReported;
}(DeviceEvent));
export { QualityReported };
/** An event reporting a fingerprint reader error.  */
var ErrorOccurred = /** @class */ (function (_super) {
    __extends(ErrorOccurred, _super);
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     * @param error - an error code.
     */
    function ErrorOccurred(deviceUid, error) {
        var _this = _super.call(this, "ErrorOccurred", deviceUid) || this;
        _this.error = error;
        return _this;
    }
    return ErrorOccurred;
}(DeviceEvent));
export { ErrorOccurred };
/** An event signaling that a fingerprint reader is ready and waiting to scan a finger. */
var AcquisitionStarted = /** @class */ (function (_super) {
    __extends(AcquisitionStarted, _super);
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    function AcquisitionStarted(deviceUid) {
        return _super.call(this, "AcquisitionStarted", deviceUid) || this;
    }
    return AcquisitionStarted;
}(DeviceEvent));
export { AcquisitionStarted };
/** An event signaling that a fingerprint reader has stopped waiting for a finger scan. */
var AcquisitionStopped = /** @class */ (function (_super) {
    __extends(AcquisitionStopped, _super);
    /** Constructs a new event object.
     * @param deviceUid - a fingeprint reader ID.
     */
    function AcquisitionStopped(deviceUid) {
        return _super.call(this, "AcquisitionStopped", deviceUid) || this;
    }
    return AcquisitionStopped;
}(DeviceEvent));
export { AcquisitionStopped };
//# sourceMappingURL=events.js.map