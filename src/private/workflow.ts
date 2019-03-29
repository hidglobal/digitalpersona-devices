import { JSONWebToken, AuthenticationHandle, User, CredentialId } from '@digitalpersona/access-management';

export class AuthenticationData
{
    public readonly handle: number;
    public readonly data: string;
}

export enum AuthenticationStep
{
    InitClient,
    InitServer,
    ContinueClient,
    ContinueServer,
    Done,
    AttemptsDepleted,
    Error
}

// Holds intermediate authentication workflow data.
// The authentication workflow essentially is a sequence of steps,
// where each step passes authentication data either from the client to the server,
// or from server to the client.
// The direction of data transfer on each step is determined by availability of
// data from an opposite side:
// * if serverData !== null, then next step is on a client side
// * if clientData !== null, then next step is on a server side
// Invariant: serverData and clientData must be never not-null at the same time
// (except on error).
export class AuthenticationContext {
    public readonly user: User|null;
    public readonly credentialId: CredentialId;
    public attempts: number;
    public serverHandle: AuthenticationHandle = 0;
    public clientHandle: AuthenticationHandle = 0;
    public serverData?: string|null;
    public clientData?: string|null;
    public result?: JSONWebToken | Error;

    constructor(credential: CredentialId, user: User|null, attempts: number = 3) {
        this.user = user;
        this.credentialId = credential;
        this.attempts = attempts
    }

    public nextStep() {
        return  (this.result)                           ? AuthenticationStep.Done :
                (this.attempts <= 0)                    ? AuthenticationStep.AttemptsDepleted :
                (!this.serverHandle)                    ? AuthenticationStep.InitServer :
                (!this.clientHandle)                    ? AuthenticationStep.InitClient :
                (!this.clientData && this.serverData)   ? AuthenticationStep.ContinueClient :
                (!this.serverData && this.clientData)   ? AuthenticationStep.ContinueServer :
            AuthenticationStep.Error;
    }

    public withClientHandle(handle: AuthenticationHandle): this {
        this.clientHandle = handle;
        this.serverData = null;
        return this;
    }
    public withServerHandle(handle: AuthenticationHandle): this {
        this.serverHandle = handle;
        this.clientData = null;
        return this;
    }
    public withServerData(data?: string): this {
        this.serverData = data;
        this.clientData = null;
        --this.attempts;    // countdown on every server response
        return (this.serverData) ? this : this.withError(new Error("No server data"));
    }
    public withClientData(data?: string): this {
        this.clientData = data;
        this.serverData = null;
        return (this.clientData) ? this : this.withError(new Error("No client data"));
    }
    public withError(error: Error): this {
        this.result = error;
        return this;
    }
    public withToken(token: JSONWebToken): this {
        this.result = token;
        return this;
    }
}
