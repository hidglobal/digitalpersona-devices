import { User, JSONWebToken, Credential, Ticket, IEnrollService } from '@digitalpersona/access-management'
import { BioSample } from '../../common';
import { Face } from './credential';

export class FaceEnroll
{
    constructor(
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){
        if (!enrollService)
            throw new Error("enrollService");
        this.enrollService = enrollService;
        this.securityOfficer = securityOfficer;
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.Face
        )
    }

    public enroll(user: JSONWebToken, samples: BioSample[], securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Face(samples)
        );
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Face([])
        );
    }

}
