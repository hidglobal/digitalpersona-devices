import { User, JSONWebToken, Credential, IEnrollService, Ticket, CredentialId } from '@digitalpersona/access-management';

/** @internal */
export abstract class Enroller
{
    constructor(
        protected readonly enrollService: IEnrollService,
        protected readonly securityOfficer?: JSONWebToken,
    ) {
        if (!this.enrollService)
            throw new Error("enrollService");
    }

    protected _canEnroll(user: User, credId: CredentialId, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            credId
        )
    }

    protected _enroll(user: JSONWebToken, credential: Credential, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            credential
        );
    }

    protected _unenroll(user: JSONWebToken, credential: Credential, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            credential
        );
    }

}
