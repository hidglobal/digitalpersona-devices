import { Credential, Base64UrlString } from "@digitalpersona/access-management";

export class BehaviorCredentialData
{
    constructor(
        public readonly StrongToken: Credential,    // Strong Token credentials
        public readonly BCToken: Credential,        // Behavior Token credentials
        public readonly BCRecord: Base64UrlString,  // Behavior Token database record
    ){}
}

export class BehaviorEnrollment
{
    public readonly Version = 1;

    constructor(
        public readonly timeStamp: number,    // last training time
        public readonly Score: number,        // training score in a range of [0..100]
    ){}
}
