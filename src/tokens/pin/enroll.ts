import { User, Ticket, IEnrollService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { PIN } from './credential';

export class PinEnroll
{
    constructor(
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){
        if (!enrollService)
            throw new Error("enrollService");
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.PIN
        )
    }

    public enroll(user: JSONWebToken, pin: string, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService
            .EnrollUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new PIN(pin));
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService
            .DeleteUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new PIN("")
            )
    }
}
