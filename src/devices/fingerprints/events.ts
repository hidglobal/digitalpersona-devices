import { DeviceEvent } from '../events';
import { SampleFormat, QualityCode } from './sample';
import { BioSample } from '@digitalpersona/core';

export class SamplesAcquired extends DeviceEvent
{
    public sampleFormat: SampleFormat;
    public samples: BioSample[];

    constructor(deviceUid: string, sampleFormat: SampleFormat, sampleData: string) {
        super("SamplesAcquired", deviceUid);
        this.sampleFormat = sampleFormat;
        this.samples = JSON.parse(sampleData) as BioSample[];
    }
}

export class QualityReported extends DeviceEvent
{
    public quality: QualityCode;

    constructor(deviceUid: string, quality: QualityCode) {
        super("QualityReported", deviceUid);
        this.quality = quality;
    }
}

export class ErrorOccurred extends DeviceEvent
{
    public error: number;

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
