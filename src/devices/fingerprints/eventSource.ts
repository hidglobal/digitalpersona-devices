import { Handler } from '../../private';
import { ErrorOccurred,
    SamplesAcquired, QualityReported,
    AcquisitionStarted, AcquisitionStopped
} from './events';

export interface FingerprintsEventSource
{
    onSamplesAcquired: Handler<SamplesAcquired>;
    onQualityReported: Handler<QualityReported>;
    onErrorOccurred: Handler<ErrorOccurred>;
    onAcquisitionStarted: Handler<AcquisitionStarted>,
    onAcquisitionStopped: Handler<AcquisitionStopped>,

    on(event: "SamplesAcquired", handler: Handler<SamplesAcquired>): this;
    on(event: "QualityReported", handler: Handler<QualityReported>): this;
    on(event: "ErrorOccurred", handler: Handler<ErrorOccurred>): this;
    on(event: "AcquisitionStarted", handler: Handler<AcquisitionStarted>): this;
    on(event: "AcquisitionStopped", handler: Handler<AcquisitionStopped>): this;
}
