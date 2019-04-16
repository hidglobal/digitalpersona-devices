import { User, JSONWebToken, IAuthService } from '@digitalpersona/access-management'
import { BioSample } from '../../common';
import { Face } from './credential';
import { Authenticator } from '../workflows';

export class FaceAuth extends Authenticator
{
    constructor(authService: IAuthService){
        super(authService)
    }

    public authenticate(identity: User|JSONWebToken, samples: BioSample[]) {
        return super._authenticate(identity,  new Face(samples));
    }

    public identify(samples: BioSample[]): Promise<JSONWebToken> {
        return super._identify(new Face(samples));
    }
}
