import { User, Credential, Ticket, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';
import { CustomAction } from './actions';
import { Password } from './credential';

export class PasswordEnroll
{
    constructor(
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){
        if (!enrollService)
            throw new Error("enrollService");
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

    // randomize(user: User, securityOfficer?: JSONWebToken): Promise<string> {
    //     return this.enrollService.CustomAction(
    //         CustomAction.PasswordRandomization,
    //         new Ticket(securityOfficer || this.securityOfficer || ""),
    //         user);
    // }

    // reset(user: User, newPassword: string, securityOfficer?: JSONWebToken): Promise<string> {
    //     return this.enrollService.CustomAction(
    //         CustomAction.PasswordReset,
    //         new Ticket(securityOfficer || this.securityOfficer || ""),
    //         user,
    //         new Password(newPassword));
    // }
}
