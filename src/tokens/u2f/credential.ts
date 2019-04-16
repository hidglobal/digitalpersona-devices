import * as u2fApi from 'u2f-api';
import { Credential } from '@digitalpersona/access-management';

export class U2F extends Credential
{
    constructor(appId: string, registration?: u2fApi.RegisterResponse, version: string = "U2F_V2") {
        super(Credential.U2F,
            registration ? { version, appId, ...registration } : null);
    }
}
