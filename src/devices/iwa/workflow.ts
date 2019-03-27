import { JSONWebToken, AuthenticationHandle } from '@digitalpersona/access-management';
import { IWAData } from './data';

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
    public attempts: number;
    public serverHandle: AuthenticationHandle = 0;
    public clientHandle: AuthenticationHandle = 0;
    public serverData?: string|null;
    public clientData?: string|null;
    public result?: JSONWebToken | Error;

    constructor(attempts: number = 3) {
        this.attempts = attempts
    }
    public withServerHandle(handle: AuthenticationHandle): this {
        this.serverHandle = handle;
        this.clientData = null;
        return this;
    }
    public withIWAData(iwa: IWAData): this {
        this.clientData = iwa.Data;
        return this.withClientData(iwa.Data);
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
