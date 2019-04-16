import { Credential } from '@digitalpersona/access-management';
import { BioSample } from '../../common';
import { FingerPosition } from './data';

export class Fingerprints extends Credential
{
    constructor(samples: BioSample[], position?: FingerPosition) {
        super(Credential.Fingerprints,
            position ? { position, samples } : samples)
    }
}
