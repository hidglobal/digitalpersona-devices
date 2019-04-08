import { User, Utf8, IAuthService, JSONWebToken, Credential, IEnrollService, Ticket } from '@digitalpersona/access-management';
import { BioSample } from '../../common';
import { Finger, Fingers, FingerPosition } from './data';
import { Fingerprints } from './credential';

export class FingerprintsApi
{
    constructor(
        private readonly authService?: IAuthService,
        private readonly enrollService?: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ) {}

    // Authenticates the user and returns a JSON Web Token.
    // Call this method when the fingerprint reader captures a biometric sample
    public authenticate(user: User, samples: BioSample[]): Promise<JSONWebToken> {
        if (!this.authService)
            return Promise.reject(new Error("authService"));
        return this.authService
            .AuthenticateUser(user, new Fingerprints(samples))
            .then(ticket => ticket.jwt);
    }

    public identify(samples: BioSample[]): Promise<JSONWebToken> {
        if (!this.authService)
            return Promise.reject(new Error("authService"));
        return this.authService
            .IdentifyUser(new Fingerprints(samples))
            .then(ticket => ticket.jwt);
    }

    public getEnrolled(user: User): Promise<Fingers>
    {
        if (!this.authService)
            return Promise.reject(new Error("authService"));
        return this.authService
            .GetEnrollmentData(user, Credential.Fingerprints)
            .then(data =>
                (JSON.parse(Utf8.fromBase64Url(data)) as object[]).map(item => Finger.fromJson(item))
            );
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.Fingerprints
        )
    }

    public enroll(user: JSONWebToken, position: FingerPosition, samples: BioSample[], securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Fingerprints(samples, position)
        );
    }

    public unenroll(user: JSONWebToken, position: FingerPosition, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Fingerprints([], position)
        );
    }
}
