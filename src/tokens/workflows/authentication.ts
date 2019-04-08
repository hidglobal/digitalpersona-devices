import { JSONWebToken, Ticket, AuthenticationHandle, AuthenticationStatus, User, Credential, CredentialId, Base64UrlString, Base64Url, IAuthService } from '@digitalpersona/access-management';

export class AuthenticationData
{
    public readonly handle: number;
    public readonly data: string;
}
export interface IAuthenticationClient
{
    init(): Promise<AuthenticationData>;
    continue(handle: number, data: string): Promise<Base64UrlString>;
    term(handle: number): Promise<void>;
}

export function authenticate(
    identity: User | JSONWebToken | null,
    credential: Credential | CredentialId,
    server: IAuthService,
    client?: IAuthenticationClient,
): Promise<JSONWebToken>
{
    // When credential data are present, use a direct authentication flow
    if (credential instanceof Credential) {
        if (!identity) identity = "*";
        return (identity instanceof User
            ? server.AuthenticateUser(identity, credential)
            : server.AuthenticateTicket(new Ticket(identity), credential))
        .then(ticket => ticket.jwt);
    }

    // When no credential data are present, use a challenge-response authentication flow
    if (!client)
        return Promise.reject(new Error("Client"))

    // Performs one step in an authentication workflow and recursively calls itself for a next step.
    // The workflow finishes when a token obtained, or an error produced.
    const nextStep = (context: AuthenticationContext): Promise<JSONWebToken> =>
    {
        switch(context.nextStep())
        {
            case AuthenticationStep.InitClient: { return client
                .init()
                .then(data => nextStep(context.withClientHandle(data.handle).withClientData(data.data)));
            }
            case AuthenticationStep.InitServer: {
                return ((identity === null) || (identity instanceof User)
                    ? server.CreateUserAuthentication(identity, credential)
                    : server.CreateTicketAuthentication(new Ticket(identity), credential))
                .then(handle => nextStep(context.withServerHandle(handle)));
            }
            case AuthenticationStep.ContinueClient: { return client
                .continue(context.clientHandle, context.serverData!)
                .then(clientData => nextStep(context.withClientData(clientData)));
            }
            case AuthenticationStep.ContinueServer: { return server
                .ContinueAuthentication(context.serverHandle, Base64Url.fromUtf8(context.clientData!))
                .then(result => {
                    switch (result.status) {
                        case AuthenticationStatus.Error:
                            return Promise.reject(new Error("Authentication failed"));
                        case AuthenticationStatus.Continue:
                            return nextStep(context.withServerData(result.authData))
                        case AuthenticationStatus.Completed:
                            return Promise.resolve(result.jwt);
                        default:
                            throw new Error("Unexpected status");
                    }
                })
            }
        }
    }

    // Start the workflow and extract a token (or throw an error) when ready.
    let context = new AuthenticationContext();
    return nextStep(context)
    .catch(err => {
         return Promise.reject(err)     // somehow exception thrown inside u2fApi does not automatically reject the promise, so forcing this here
     })
    .finally(() => {
        if (context.clientHandle) client.term(context.clientHandle);                     // ignore the outcome
        if (context.serverHandle) server.DestroyAuthentication(context.serverHandle);    // ignore the outcome
    });
}


export enum AuthenticationStep
{
    InitClient,
    InitServer,
    ContinueClient,
    ContinueServer,
}

// Holds intermediate authentication workflow data and ensures workflow invariantss.
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
    public maxRounds: number;
    public serverHandle: AuthenticationHandle = 0;
    public clientHandle: AuthenticationHandle = 0;
    public serverData?: string|null;
    public clientData?: string|null;

    constructor(maxRounds: number = 3) {
        this.maxRounds = maxRounds
    }

    public nextStep() {
        return  (!this.serverHandle)                    ? AuthenticationStep.InitServer :
                (!this.clientHandle)                    ? AuthenticationStep.InitClient :
                (!this.clientData && this.serverData)   ? AuthenticationStep.ContinueClient :
                (!this.serverData && this.clientData)   ? AuthenticationStep.ContinueServer :
                (()=>{throw new Error("Invalid state")})();
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
        if (!this.serverData) throw new Error("No server data");
        --this.maxRounds;    // countdown on every server response
        if (this.maxRounds <= 0) throw new Error("Handshake stalled");
        return this;
    }
    public withClientData(data?: string): this {
        this.clientData = data;
        this.serverData = null;
        if (!this.clientData) throw new Error("No client data");
        return this;
    }
}
