/**
 * A fingerprint sample format.
 */
export enum SampleFormat {
    /** A raw fingerprint image (bitmap). */
    Raw = 1,
    /** A fingerprint feature set in a DigitalPersona proprietary format. To use with DigitalPersona fingerprint matching engine only. */
    Intermediate = 2,
    /** A fingerprint image compressed using Wavelet Scalar Quantization (WSQ) algotithm. */
    Compressed = 3,
    /** A fingerprint image in a Portable Network Graphics (PNG) format. */
    PngImage = 5,
}

/**
 * A figerprint image quality.
 */
export enum QualityCode {
    Good = 0,
    NoImage = 1,
    TooLight = 2,
    TooDark = 3,
    TooNoisy = 4,
    LowContrast = 5,
    NotEnoughFeatures = 6,
    NotCentered = 7,
    NotAFinger = 8,
    TooHigh = 9,
    TooLow = 10,
    TooLeft = 11,
    TooRight = 12,
    TooStrange = 13,
    TooFast = 14,
    TooSkewed = 15,
    TooShort = 16,
    TooSlow = 17,
    ReverseMotion = 18,
    PressureTooHard = 19,
    PressureTooLight = 20,
    WetFinger = 21,
    FakeFinger = 22,
    TooSmall = 23,
    RotatedTooMuch = 24,
}
