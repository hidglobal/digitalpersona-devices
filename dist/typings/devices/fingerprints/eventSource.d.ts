import { Handler } from '../../private';
import { ErrorOccurred, SamplesAcquired, QualityReported, AcquisitionStarted, AcquisitionStopped } from './events';
/** @internal
 * A fingerprint reader event source.
 */
export interface FingerprintsEventSource {
    onSamplesAcquired: Handler<SamplesAcquired>;
    onQualityReported: Handler<QualityReported>;
    onErrorOccurred: Handler<ErrorOccurred>;
    onAcquisitionStarted: Handler<AcquisitionStarted>;
    onAcquisitionStopped: Handler<AcquisitionStopped>;
    on(event: "SamplesAcquired", handler: Handler<SamplesAcquired>): Handler<SamplesAcquired>;
    on(event: "QualityReported", handler: Handler<QualityReported>): Handler<QualityReported>;
    on(event: "ErrorOccurred", handler: Handler<ErrorOccurred>): Handler<ErrorOccurred>;
    on(event: "AcquisitionStarted", handler: Handler<AcquisitionStarted>): Handler<AcquisitionStarted>;
    on(event: "AcquisitionStopped", handler: Handler<AcquisitionStopped>): Handler<AcquisitionStopped>;
}
