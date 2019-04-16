import * as u2fApi from 'u2f-api';
import { User, Credential, JSONWebToken, IAuthService, Ticket } from '@digitalpersona/access-management';
import { Authenticator } from '../workflows';
import { CustomAction, U2FAppId } from './actions';
import { U2FClient } from './client';

export class U2FAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService, new U2FClient())
    }

    public static isSupported(): Promise<boolean> {
        return u2fApi.isSupported();
    }

    public getAppId(): Promise<string> {
        return this.authService
            .CustomAction(CustomAction.RequestAppId, Ticket.None(), User.Anonymous(), new Credential(Credential.U2F, ""))
            .then(data =>
                (JSON.parse(data) as U2FAppId).AppId);
    }

    public authenticate(identity: User|JSONWebToken): Promise<JSONWebToken> {
        return super._authenticate(identity, Credential.U2F);
    }
}


