import { User, JSONWebToken, Credential, IEnrollService } from '@digitalpersona/access-management'
import { BioSample } from '../../common';
import { Face } from './credential';
import { Enroller } from '../workflows/enrollment';

export class FaceEnroll extends Enroller
{
    constructor(enrollService: IEnrollService, securityOfficer?: JSONWebToken) {
        super(enrollService, securityOfficer)
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return super._canEnroll(user, Credential.Face, securityOfficer);
    }

    public enroll(user: JSONWebToken, samples: BioSample[], securityOfficer?: JSONWebToken): Promise<void> {
        return super._enroll(user, new Face(samples), securityOfficer);
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return super._unenroll(user, new Face([]), securityOfficer);
    }

}
