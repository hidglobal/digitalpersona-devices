import { User, IAuthService, JSONWebToken, Ticket, Credential, Base64Url } from '@digitalpersona/access-management';
import { CustomAction } from './actions'
import { TimeOTP, SmsOTP, EmailOTP, PushNotification, HardwareTimeOTP } from './credential';
import { Authenticator } from '../workflows';

export class TimeOtpAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    // Authenticate the user using user's response on the challenge
    public authenticate(identity: User|JSONWebToken, code: string) {
        return super._authenticate(identity, new TimeOTP(code));
    }

    public getUnlockCode(userOrSerialNumber: User|string, challenge: string, token?: JSONWebToken) {
        const [ user, serialNumber ] =
            (userOrSerialNumber instanceof User)
                ? [ userOrSerialNumber, null ]
                : [ User.Anonymous(), userOrSerialNumber];
        return this.authService
            .CustomAction(CustomAction.UnlockActiveIdHardwareToken,
                new Ticket(token || ""),
                user,
                new Credential(Credential.OneTimePassword, {
                    challenge,
                    serialNumber
            }));
    }
}

export class PushOtpAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    // Authenticate the user using user's response on the challenge
    public authenticate(identity: User|JSONWebToken) {
        return super._authenticate(identity, new PushNotification());
    }
}

export class SmsOtpAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    // send a verification code using SMS to the user's verified device
    public sendChallenge(user: User): Promise<void> {
        return this.authService
            .CustomAction(CustomAction.SendSMSRequest, new Ticket(""), user, new SmsOTP())
            .then(result => {});
    }

    public authenticate(identity: User|JSONWebToken, code: string): Promise<JSONWebToken>
    {
        return super._authenticate(identity, new SmsOTP(code));
    }
}


export class EmailOtpAUth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    // send a verification code using SMS to the user's verified device
    public sendChallenge(user: User): Promise<void> {
        return this.authService
            .CustomAction(CustomAction.SendEmailRequest, new Ticket(""), user, new EmailOTP(""))
            .then(result => {});
    }

    public authenticate(identity: User|JSONWebToken, code: string): Promise<JSONWebToken>
    {
        return super._authenticate(identity, new EmailOTP(code));
    }
}
