import { Credential, Base64Url } from '@digitalpersona/access-management';

/**@internal */
export class TimeOTP extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, code);
    }
}

/**@internal */
export class SoftwareTimeOTP extends Credential
{
    constructor(code: string, key: string, phoneNumber?: string) {
        super(Credential.OneTimePassword, {
            otp: code,
            key: Base64Url.fromUtf16(key),
            phoneNumber,
        });
    }
}

/**@internal */
export class HardwareTimeOTP extends Credential
{
    constructor(code: string, serialNumber: string, counter?: string, timer?: string) {
        super(Credential.OneTimePassword, {
            otp: code,
            serialNumber,
            counter,
            timer,
        });
    }
}

/**@internal */
export class EmailOTP extends Credential
{
    constructor(code: string) {
        super(Credential.Email, code);
    }
}

/**@internal */
export class SmsOTP extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, code);
    }
}

/**@internal */
export class PushNotification extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, "push");
    }
}

