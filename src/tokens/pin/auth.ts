import { User, Ticket, IAuthService, IEnrollService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { PIN } from './credential';
import { authenticate } from '../workflows';

export class PinAuth
{
    constructor(
        private readonly authService: IAuthService,
    ){
        if (!this.authService)
            throw new Error("authService");
    }

    public authenticate(identity: User|JSONWebToken, pin: string): Promise<JSONWebToken> {
        return authenticate(identity, new PIN(pin), this.authService);
    }
}
