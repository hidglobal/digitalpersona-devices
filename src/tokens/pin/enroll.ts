import { User, IEnrollService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { PIN } from './credential';
import { Enroller } from '../workflows/enrollment';

export class PinEnroll extends Enroller
{
    constructor(
        enrollService: IEnrollService,
        securityOfficer?: JSONWebToken,
    ){
        super(enrollService, securityOfficer);
    }

    public canEnroll(
        user: User,
        securityOfficer?: JSONWebToken): Promise<void>
    {
        return super._canEnroll(user, Credential.PIN, securityOfficer);
    }

    public enroll(
        user: JSONWebToken,
        pin: string,
        securityOfficer?: JSONWebToken): Promise<void>
    {
        return super._enroll(user, new PIN(pin), securityOfficer);
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return super._unenroll(user, new PIN(""), securityOfficer);
    }
}
