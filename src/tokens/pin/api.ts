import { User, Ticket, IAuthService, IEnrollService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { PIN } from './credential';

export class PinApi
{
    constructor(
        private readonly authService: IAuthService,
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer: JSONWebToken,
    ){}

    public authenticate(user: User, pin: string): Promise<JSONWebToken> {
        return this.authService
            .AuthenticateUser(user, new PIN(pin))
            .then(ticket => ticket.jwt);
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer),
            user,
            Credential.PIN
        )
    }

    public enroll(user: JSONWebToken, pin: string, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService
            .EnrollUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new PIN(pin));
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService
            .DeleteUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new PIN("")
            )
    }

    // public isEnrolled(user: User): Promise<boolean> {
    //     this.enrollService
    // }
}
