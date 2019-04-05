export enum FingerPosition {
    Unknown         = 0,
    RightThumb      = 1,
    RightIndex      = 2,
    RightMiddle     = 3,
    RightRing       = 4,
    RightLittle     = 5,
    LeftThumb       = 6,
    LeftIndex       = 7,
    LeftMiddle      = 8,
    LeftRing        = 9,
    LeftLittle      = 10,
}

export class FingerEnrollment
{
    constructor(
        public readonly position: FingerPosition,
    ){}

    public static fromJson(json: object)
    {
        const obj = json as FingerEnrollment;
        return new FingerEnrollment(obj.position);
    }
}

export type FingerEnrollmentData = FingerEnrollment[];
