/**
 * A fingerprint sample format.
 */
export enum SampleFormat {
    /** A raw fingerprint image (bitmap). */
    Raw = 1,
    /** A fingerprint image encoded into an intermediate format. */
    Intermediate = 2,
    /** A compressed fingerprint image (e.q. JPEG2000, WSQ). */
    Compressed = 3,
    /** A Portable Network Graphics (PNG) format. */
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
