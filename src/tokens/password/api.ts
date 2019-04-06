import { User, Credential, Ticket, IAuthService, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';
import { CustomAction } from './actions';
import { Password } from './credential';

export class PasswordApi
{
    constructor(
        private readonly authService: IAuthService,
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer: JSONWebToken,
    ){}

    authenticate(user: User, password: string): Promise<JSONWebToken> {
        return this.authService
            .AuthenticateUser(user, new Password(password))
            .then(ticket => ticket.jwt);
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.Password
        )
    }

    enroll(user: JSONWebToken, password: string, oldPassword: string|null = null, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService
            .EnrollUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new Password(password));
    }

    randomize(user: User, securityOfficer?: JSONWebToken): Promise<string> {
        return this.authService.CustomAction(
            CustomAction.PasswordRandomization,
            new Ticket(securityOfficer || this.securityOfficer),
            user);
    }

    reset(user: User, newPassword: string, securityOfficer?: JSONWebToken): Promise<string> {
        return this.authService.CustomAction(
            CustomAction.PasswordReset,
            new Ticket(securityOfficer || this.securityOfficer),
            user,
            new Password(newPassword));
    }
}
