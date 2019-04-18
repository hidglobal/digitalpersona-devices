import { Utf16, Base64UrlString } from "@digitalpersona/access-management";

export type OTPCode = string;

/**@internal */
export const OTPPushCode = "push";

/**@internal */
export class OTPEnrollmentData
{
    constructor(
        public readonly phoneNumber: string,        // Last 4 digits of registered Phone number
        public readonly serialNumber: string,       // Last 4 digits of HD OTP Serial number
        public readonly pn_tenant_id?: string|null, // Push Notification Tenant Id.
        public readonly pn_api_key?: string|null,   // Push Notification API Key.
        public readonly nexmo_api_key?: "set",      // Nexmo API Key ("set" - set by customer; otherwise omitted).
        public readonly nexmo_api_secret?: "set",   // Nexmo API Secret ("set" - set by customer; otherwise omitted)
    ){}

    public static fromEnrollmentData(data: Base64UrlString)
    {
        const obj: OTPEnrollmentData = JSON.parse(Utf16.fromBase64Url(data));
        return new OTPEnrollmentData(
            obj.phoneNumber, obj.serialNumber,
            obj.pn_tenant_id, obj.pn_api_key,
            obj.nexmo_api_key, obj.nexmo_api_secret);
    }
}


/**@internal */
export class SMSEnrollData
{
    constructor(
        public readonly key: string,
        public readonly phoneNumber: string,
        public readonly otp?: string|null,
    ){}
}

/**@internal */
export class OTPUnlockData
{
    constructor(
        serialNumber?: string|null, // Token serial number. If null or omitted, a user who is a token owner must be provided.
        challenge?: string|null,    // Token challenge. Can be set to null when the locked device was initialized for static unlock (i.e. no challenge/response).
    ){}
}

/**@internal */
export class EMailEnrollmentData
{
    constructor(
        public readonly has_mail: boolean,    // true if user has e-mail data enrolled
    ){}
}
