import { DeviceEvent } from '../events';
import { SampleFormat, QualityCode } from './sample'

export class SamplesAcquired extends DeviceEvent
{
    sampleFormat: SampleFormat;
    samples: string;

    constructor(deviceUid: string, sampleFormat: SampleFormat, samples: string) {
        super("SamplesAcquired", deviceUid);
        this.sampleFormat = sampleFormat;
        this.samples = samples;
    }
}

export class QualityReported extends DeviceEvent
{
    quality: QualityCode;

    constructor(deviceUid: string, quality: QualityCode) {
        super("QualityReported", deviceUid);
        this.quality = quality;
    }
}

export class ErrorOccurred extends DeviceEvent
{
    error: number;

    constructor(deviceUid: string, error: number) {
        super("ErrorOccurred", deviceUid);
        this.error = error;
    }
}

export class AcquisitionStarted extends DeviceEvent
{
    constructor(deviceUid: string) {
        super("AcquisitionStarted", deviceUid);
    }
}

export class AcquisitionStopped extends DeviceEvent
{
    constructor(deviceUid: string) {
        super("AcquisitionStopped", deviceUid);
    }
}
