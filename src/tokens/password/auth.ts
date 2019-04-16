import { User, Ticket, IAuthService, JSONWebToken } from '@digitalpersona/access-management';
import { CustomAction } from './actions';
import { Password } from './credential';
import { Authenticator } from '../workflows';

export class PasswordAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService);
    }

    public authenticate(identity: User|JSONWebToken, password: string): Promise<JSONWebToken> {
        return super._authenticate(identity, new Password(password));
    }

    public randomize(user: User, token: JSONWebToken): Promise<string> {
        return this.authService.CustomAction(
            CustomAction.PasswordRandomization,
            new Ticket(token),
            user);
    }

    public reset(user: User, newPassword: string, token: JSONWebToken): Promise<string> {
        return this.authService.CustomAction(
            CustomAction.PasswordReset,
            new Ticket(token),
            user,
            new Password(newPassword));
    }
}
