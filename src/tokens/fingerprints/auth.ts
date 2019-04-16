import { User, Utf8, IAuthService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { BioSample } from '../../common';
import { Finger, Fingers } from './data';
import { Fingerprints } from './credential';
import { Authenticator } from '../workflows';

export class FingerprintsAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    public getEnrolledFingers(user: User): Promise<Fingers>
    {
        return this.authService
            .GetEnrollmentData(user, Credential.Fingerprints)
            .then(data =>
                (JSON.parse(Utf8.fromBase64Url(data)) as object[])
                .map(item => Finger.fromJson(item))
            );
    }

    // Authenticates the user and returns a JSON Web Token.
    // Call this method when the fingerprint reader captures a biometric sample
    public authenticate(identity: User|JSONWebToken, samples: BioSample[]): Promise<JSONWebToken> {
        return super._authenticate(identity, new Fingerprints(samples));
    }

    public identify(samples: BioSample[]): Promise<JSONWebToken> {
        return super._identify(new Fingerprints(samples));
    }
}
