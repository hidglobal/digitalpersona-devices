/**
 * A fingerprint sample format.
 */
export var SampleFormat;
(function (SampleFormat) {
    /** A raw fingerprint image (bitmap). */
    SampleFormat[SampleFormat["Raw"] = 1] = "Raw";
    /** A fingerprint image encoded into an intermediate format. */
    SampleFormat[SampleFormat["Intermediate"] = 2] = "Intermediate";
    /** A compressed fingerprint image (e.q. JPEG2000, WSQ). */
    SampleFormat[SampleFormat["Compressed"] = 3] = "Compressed";
    /** A Portable Network Graphics (PNG) format. */
    SampleFormat[SampleFormat["PngImage"] = 5] = "PngImage";
})(SampleFormat || (SampleFormat = {}));
/**
 * A figerprint image quality.
 */
export var QualityCode;
(function (QualityCode) {
    QualityCode[QualityCode["Good"] = 0] = "Good";
    QualityCode[QualityCode["NoImage"] = 1] = "NoImage";
    QualityCode[QualityCode["TooLight"] = 2] = "TooLight";
    QualityCode[QualityCode["TooDark"] = 3] = "TooDark";
    QualityCode[QualityCode["TooNoisy"] = 4] = "TooNoisy";
    QualityCode[QualityCode["LowContrast"] = 5] = "LowContrast";
    QualityCode[QualityCode["NotEnoughFeatures"] = 6] = "NotEnoughFeatures";
    QualityCode[QualityCode["NotCentered"] = 7] = "NotCentered";
    QualityCode[QualityCode["NotAFinger"] = 8] = "NotAFinger";
    QualityCode[QualityCode["TooHigh"] = 9] = "TooHigh";
    QualityCode[QualityCode["TooLow"] = 10] = "TooLow";
    QualityCode[QualityCode["TooLeft"] = 11] = "TooLeft";
    QualityCode[QualityCode["TooRight"] = 12] = "TooRight";
    QualityCode[QualityCode["TooStrange"] = 13] = "TooStrange";
    QualityCode[QualityCode["TooFast"] = 14] = "TooFast";
    QualityCode[QualityCode["TooSkewed"] = 15] = "TooSkewed";
    QualityCode[QualityCode["TooShort"] = 16] = "TooShort";
    QualityCode[QualityCode["TooSlow"] = 17] = "TooSlow";
    QualityCode[QualityCode["ReverseMotion"] = 18] = "ReverseMotion";
    QualityCode[QualityCode["PressureTooHard"] = 19] = "PressureTooHard";
    QualityCode[QualityCode["PressureTooLight"] = 20] = "PressureTooLight";
    QualityCode[QualityCode["WetFinger"] = 21] = "WetFinger";
    QualityCode[QualityCode["FakeFinger"] = 22] = "FakeFinger";
    QualityCode[QualityCode["TooSmall"] = 23] = "TooSmall";
    QualityCode[QualityCode["RotatedTooMuch"] = 24] = "RotatedTooMuch";
})(QualityCode || (QualityCode = {}));
//# sourceMappingURL=sample.js.map