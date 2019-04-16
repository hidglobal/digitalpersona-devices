import { User, JSONWebToken, Credential, IEnrollService, Ticket, Utf8 } from '@digitalpersona/access-management';
import { BioSample } from '../../common';
import { FingerPosition, Finger, Fingers } from './data';
import { Fingerprints } from './credential';
import { Enroller } from '../workflows/enrollment';

export class FingerprintsEnroll extends Enroller
{
    constructor(enrollService: IEnrollService, securityOfficer?: JSONWebToken) {
        super(enrollService, securityOfficer)
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
        return super._canEnroll(user, Credential.Fingerprints, securityOfficer);
    }

    public enroll(user: JSONWebToken, position: FingerPosition, samples: BioSample[], securityOfficer?: JSONWebToken): Promise<void> {
        return super._enroll(user, new Fingerprints(samples, position), securityOfficer);
    }

    public unenroll(user: JSONWebToken, position: FingerPosition, securityOfficer?: JSONWebToken): Promise<void> {
        return super._unenroll(user, new Fingerprints([], position), securityOfficer);
    }
}
