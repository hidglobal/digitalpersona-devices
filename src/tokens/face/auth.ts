import { User, JSONWebToken, IAuthService } from '@digitalpersona/access-management'
import { BioSample } from '../../common';
import { Face } from './credential';
import { authenticate } from '../workflows';

export class FaceAuth
{
    constructor(
        private readonly authService: IAuthService,
    ){
        if (!this.authService)
            throw new Error("authService");
    }

    public authenticate(identity: User|JSONWebToken, samples: BioSample[]) {
        return authenticate(identity,  new Face(samples), this.authService);
    }

    public identify(samples: BioSample[]): Promise<JSONWebToken> {
        return this.authService
            .IdentifyUser(new Face(samples))
            .then(ticket => ticket.jwt);
    }
}
