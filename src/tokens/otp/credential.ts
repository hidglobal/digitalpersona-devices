import { Credential, Base64Url } from '@digitalpersona/access-management';

export class TimeOTP extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, code);
    }
}

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

export class EmailOTP extends Credential
{
    constructor(code: string) {
        super(Credential.Email, code);
    }
}

export class SmsOTP extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, code);
    }
}

export class PushNotification extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, "push");
    }
}

