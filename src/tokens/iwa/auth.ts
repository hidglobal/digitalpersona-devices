import { Credential, JSONWebToken, IAuthService } from '@digitalpersona/access-management';
import { Authenticator } from '../workflows';
import { WindowsAuthClient } from '../../devices';

export class WindowsAuth extends Authenticator
{
    constructor(authService: IAuthService, client: WindowsAuthClient) {
        super(authService, client)
    }

    public authenticate(): Promise<JSONWebToken> {
        return super._authenticate(null, Credential.IWA);
    }
}

