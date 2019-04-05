import { User, Base64Url, Utf8, IAuthService, JSONWebToken, Credential } from '@digitalpersona/access-management';

export class OTP
{
    private readonly server: IAuthService;

    constructor(server: IAuthService)
    {
        this.server = server;
    }

    // send a verification code using email, SMS, push notification, voice call or any other channel
    // to the user's verified device
    public sendChallenge() {}

    // Authenticate the user using user's response on the challenge
    public authenticate(user: User, data: string) {}

}
