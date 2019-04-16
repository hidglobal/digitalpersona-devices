import { User, Credential, Ticket, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';
import { CustomAction } from './actions';
import { Password } from './credential';
import { Enroller } from '../workflows/enrollment';

export class PasswordEnroll extends Enroller
{
    constructor(enrollService: IEnrollService, securityOfficer?: JSONWebToken) {
        super(enrollService, securityOfficer)
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return super._canEnroll(user, Credential.Password, securityOfficer);
    }

    public enroll(user: JSONWebToken, newPassword: string, oldPassword: string, securityOfficer?: JSONWebToken): Promise<void> {
        return super._enroll(user, new Password(newPassword, oldPassword), securityOfficer);
    }

    public reset(user: JSONWebToken, newPassword: string, securityOfficer?: JSONWebToken): Promise<void> {
        // TODO: this operation is not supported for AD users, check and throw
        return super._enroll(user, new Password(newPassword, null), securityOfficer);
    }

    public randomize(user: User, securityOfficer?: JSONWebToken): Promise<string> {
        return this.enrollService.CustomAction(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            new Password(""),
            CustomAction.PasswordRandomization);
    }

    // reset(user: User, newPassword: string, securityOfficer?: JSONWebToken): Promise<string> {
    //     return this.enrollService.CustomAction(
    //         CustomAction.PasswordReset,
    //         new Ticket(securityOfficer || this.securityOfficer || ""),
    //         user,
    //         new Password(newPassword));
    // }
}
