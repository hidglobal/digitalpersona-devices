export class SmartCardEnrollment
{
    constructor(
        public readonly version: number,     // version
        public readonly timeStamp: number,   // enrollment time
        public readonly keyHash: string,     // public key’s hash.
        public readonly nickname: string,    // token’s nickname
    ){}
}

export type SmartCardEnrollmentData = SmartCardEnrollment[];

