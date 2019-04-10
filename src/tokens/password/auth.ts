import { User, IAuthService, JSONWebToken } from '@digitalpersona/access-management';
import { CustomAction } from './actions';
import { Password } from './credential';
import { authenticate } from '../workflows';

export class PasswordAuth
{
    constructor(
        private readonly authService: IAuthService,
    ){
        if (!this.authService)
            throw new Error("authService");
    }

    authenticate(identity: User|JSONWebToken, password: string): Promise<JSONWebToken> {
        return authenticate(identity, new Password(password), this.authService);
    }

    // randomize(user: User, securityOfficer?: JSONWebToken): Promise<string> {
    //     return this.authService.CustomAction(
    //         CustomAction.PasswordRandomization,
    //         new Ticket(securityOfficer || this.securityOfficer || ""),
    //         user);
    // }

    // reset(user: User, newPassword: string, securityOfficer?: JSONWebToken): Promise<string> {
    //     return this.authService.CustomAction(
    //         CustomAction.PasswordReset,
    //         new Ticket(securityOfficer || this.securityOfficer || ""),
    //         user,
    //         new Password(newPassword));
    // }
}
