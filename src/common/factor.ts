import { Base64UrlString } from "@digitalpersona/access-management";

export enum BioFactor
{
    Multiple            = 0x0001,
    FacialFeatures      = 0x0002,
    Voice               = 0x0004,
    Fingerprint         = 0x0008,
    Iris                = 0x0010,
    Retina              = 0x0020,
    HandGeometry        = 0x0040,
    SignatureDynamics   = 0x0080,
    KeystrokeDynamics   = 0x0100,
    LipMovement         = 0x0200,
    ThermalFaceImage    = 0x0400,
    ThermalHandImage    = 0x0800,
    Gait                = 0x1000,
}

// Biometric owner ID registered with IBIA (http://www.ibia.org/base/cbeff/_biometric_org.phpx).
export enum BioSampleFormatOwner
{
    None                = 0,
    Neurotechnologija   = 49,   // fingerprints
    DigitalPersona      = 51,   // fingerprints
    Cognitec            = 99,   // face
    Innovatrics         = 53,   // face
}

export class BioSampleFormat
{
    constructor(
        public readonly FormatOwner: BioSampleFormatOwner,
        public readonly FormatID: number,                        // Vendor specific format ID
    ){}
}

export enum BioSampleType
{
    Raw                 = 0x01,   // Raw image
    Intermediate        = 0x02,   // Feature set
    Processed           = 0x04,   // Template
    RawWSQCompressed    = 0x08,   // WSQ compressed image
    Encrypted           = 0x10,
    Signed              = 0x20,
}

export enum BioSamplePurpose
{
    Any                         = 0,
    Verify                      = 1,
    Identify                    = 2,
    Enroll                      = 3,
    EnrollForVerificationOnly   = 4,
    EnrollForIdentificationOnly = 5,
    Audit                       = 6
}

export enum BioSampleEncryption
{
    None   = 0,     // Data is not encrypted
    XTEA    = 1,    // XTEA encryption with well known key
}

export class BioSampleHeader
{
    constructor(
        public Factor: BioFactor,               // Biometric factor. Must be set to 8 for fingerprint
        public Format: BioSampleFormat,         // Format owner (vendor) information
        public Type: BioSampleType,             // type of biometric sample
        public Purpose: BioSamplePurpose,       // Purpose of biometric sample
        public Quality: number,                 // Quality of biometric sample. If we don't support quality it should be set to -1.
        public Encryption: BioSampleEncryption, // Encryption of biometric sample.
    ){}
}

export class BioSample
{
    public readonly Version = 1;

    constructor(
        public readonly Header: BioSampleHeader,    // Biometric sample header
        public readonly Data: Base64UrlString,      // Base64url encoded biometric sample data
    ){}
}
