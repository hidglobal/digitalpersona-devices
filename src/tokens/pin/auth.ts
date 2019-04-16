import { User, Ticket, IAuthService, IEnrollService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { PIN } from './credential';
import { Authenticator } from '../workflows';

export class PinAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    public authenticate(identity: User|JSONWebToken, pin: string): Promise<JSONWebToken> {
        return super._authenticate(identity, new PIN(pin));
    }
}
