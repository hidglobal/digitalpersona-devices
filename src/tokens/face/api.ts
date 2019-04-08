import { User, JSONWebToken, Credential, Ticket, IAuthService, IEnrollService } from '@digitalpersona/access-management'
import { BioSample } from '../../common';
import { Face } from './credential';

export class FaceApi
{
    constructor(
        private readonly authService: IAuthService,
        private readonly enrollService?: IEnrollService,
        private readonly securityOfficer?: JSONWebToken
    ){}

    public authenticate(user: User, samples: BioSample[]) {
        if (!this.authService)
            return Promise.reject(new Error("authService"));
        return this.authService
            .AuthenticateUser(user, new Face(samples))
            .then(ticket => ticket.jwt);
    }

    public identify(samples: BioSample[]): Promise<JSONWebToken> {
        if (!this.authService)
            return Promise.reject(new Error("authService"));
        return this.authService
            .IdentifyUser(new Face(samples))
            .then(ticket => ticket.jwt);
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.Face
        )
    }

    public enroll(user: JSONWebToken, samples: BioSample[], securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Face(samples)
        );
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Face([])
        );
    }

}
