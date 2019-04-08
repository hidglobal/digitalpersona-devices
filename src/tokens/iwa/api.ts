import { Credential, JSONWebToken, IAuthService } from '@digitalpersona/access-management';
import { IAuthenticationClient, authenticate } from '../workflows';

export class WindowsAuthApi
{
    constructor(
        private readonly authService: IAuthService,
        private readonly client: IAuthenticationClient,
    ){}

    public authenticate(): Promise<JSONWebToken> {
        return authenticate(null, Credential.IWA, this.authService, this.client);
    }
}

