import { User, JSONWebToken, Credential, IEnrollService, Ticket, Utf8 } from '@digitalpersona/access-management';
import { BioSample } from '../../common';
import { FingerPosition, Finger, Fingers } from './data';
import { Fingerprints } from './credential';

export class FingerprintsEnroll
{
    constructor(
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ) {
        if (!this.enrollService)
            throw new Error("enrollService");
    }

    public getEnrolledFingers(user: User): Promise<Fingers>
    {
        return this.enrollService
            .GetEnrollmentData(user, Credential.Fingerprints)
            .then(data =>
                (JSON.parse(Utf8.fromBase64Url(data)) as object[]).map(item => Finger.fromJson(item))
            );
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.Fingerprints
        )
    }

    public enroll(user: JSONWebToken, position: FingerPosition, samples: BioSample[], securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Fingerprints(samples, position)
        );
    }

    public unenroll(user: JSONWebToken, position: FingerPosition, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Fingerprints([], position)
        );
    }
}
