import { Base64String, Base64UrlString, Base64Url } from '@digitalpersona/access-management';
import { BioSample, BioSampleHeader, BioSampleFormatOwner, BioSamplePurpose, BioSampleType, BioSampleEncryption, BioFactor, BioSampleFormat } from '../../common';

export class FIRData
{
    public readonly version = 1;

    constructor(
        public readonly SDKVersion: number,
        public readonly Data: Base64UrlString
    ){}
}

export enum FaceImageType
{
    Jpeg = 1
}

export class FaceImage
{
    public readonly version = 1;

    constructor(
        public readonly ImageData: Base64UrlString,
        public readonly ImageType: FaceImageType = FaceImageType.Jpeg,
    ){}

    static fromDataURL(image: Base64String): FaceImage {
        return new FaceImage(image.replace("data:image/jpeg;base64,", ""));
    }

    static fromCanvas(canvas: HTMLCanvasElement, quality: number = 1.0): FaceImage {
        return FaceImage.fromDataURL(canvas.toDataURL("image/jpeg", quality));
    }

    public toBioSample(): BioSample
    {
        return new BioSample(
            new BioSampleHeader(
                BioFactor.FacialFeatures,
                new BioSampleFormat(BioSampleFormatOwner.None, 0),
                BioSampleType.Raw,
                BioSamplePurpose.Verify,
                -1,
                BioSampleEncryption.Nnone),
                Base64Url.fromUtf8(JSON.stringify(this.ImageData))
        );
    }
}
