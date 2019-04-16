import { Credential, Base64Url } from '@digitalpersona/access-management';

export class TimeOTP extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, Base64Url.fromUtf16(JSON.stringify(
            code
        )));
    }
}

export class SoftwareTimeOTP extends Credential
{
    constructor(code: string, key: string, phoneNumber?: string) {
        super(Credential.OneTimePassword, Base64Url.fromUtf16(JSON.stringify(
            {
                otp: code,
                key: Base64Url.fromUtf16(key),
                phoneNumber,
            }
        )));
    }
}

export class HardwareTimeOTP extends Credential
{
    constructor(code: string, serialNumber: string, counter?: string, timer?: string) {
        super(Credential.OneTimePassword, Base64Url.fromUtf16(JSON.stringify(
            {
                otp: code,
                serialNumber,
                counter,
                timer,
            }
        )));
    }
}

export class EmailOTP extends Credential
{
    constructor(code: string) {
        super(Credential.Email, Base64Url.fromUtf16(JSON.stringify(
            code
        )));
    }
}

export class SmsOTP extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, code ? Base64Url.fromUtf16(JSON.stringify(
            code
        )): "");
    }
}

export class PushNotification extends Credential
{
    constructor(code?: string) {
        super(Credential.OneTimePassword, Base64Url.fromUtf16(JSON.stringify(
            "push"
        )));
    }
}

