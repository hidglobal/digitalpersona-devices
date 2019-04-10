import { User, Utf8, IAuthService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { BioSample } from '../../common';
import { Finger, Fingers } from './data';
import { Fingerprints } from './credential';
import { authenticate } from '../workflows';

export class FingerprintsAuth
{
    constructor(
        private readonly authService: IAuthService,
    ) {
        if (!this.authService)
            throw new Error("authService");
    }

    // Authenticates the user and returns a JSON Web Token.
    // Call this method when the fingerprint reader captures a biometric sample
    public authenticate(identity: User|JSONWebToken, samples: BioSample[]): Promise<JSONWebToken> {
        return authenticate(identity, new Fingerprints(samples), this.authService);
    }

    public identify(samples: BioSample[]): Promise<JSONWebToken> {
        return this.authService
            .IdentifyUser(new Fingerprints(samples))
            .then(ticket => ticket.jwt);
    }

    public getEnrolledFingers(user: User): Promise<Fingers>
    {
        return this.authService
            .GetEnrollmentData(user, Credential.Fingerprints)
            .then(data =>
                (JSON.parse(Utf8.fromBase64Url(data)) as object[]).map(item => Finger.fromJson(item))
            );
    }
}
