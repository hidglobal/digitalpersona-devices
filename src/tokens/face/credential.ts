import { Credential, Base64Url } from '@digitalpersona/access-management';
import { BioSample } from '../../common';

export class Face extends Credential
{
    constructor(samples: BioSample[]) {
        super(Credential.Face, Base64Url.fromUtf16(JSON.stringify(
            samples
        )))
    }
}
