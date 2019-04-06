import { Credential, Base64Url } from '@digitalpersona/access-management';
import { BioSample } from '../../common';
import { FingerPosition } from './data';

export class Fingerprints extends Credential
{
    constructor(samples: BioSample[], position?: FingerPosition) {
        super(Credential.Fingerprints, Base64Url.fromUtf16(JSON.stringify(
            position ? { position, samples } : samples
        )))
    }
}
