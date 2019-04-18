import { AuthenticationHandle } from '@digitalpersona/access-management';

/** @internal */
export enum HandshakeStep
{
    InitClient,
    InitServer,
    ContinueClient,
    ContinueServer,
}

/** @internal
Holds intermediate authentication workflow data and ensures workflow invariants.
The authentication workflow essentially is a sequence of steps,
where each step passes authentication data either from the client to the server,
or from server to the client.
The direction of data transfer on each step is determined by availability of
data from an opposite side:
* if serverData !== null, then next step is on a client side
* if clientData !== null, then next step is on a server side
Invariant: serverData and clientData must be never not-null at the same time
(except on error).
*/
export class HandshakeContext {
    public maxRounds: number;
    public serverHandle: AuthenticationHandle = 0;
    public clientHandle: AuthenticationHandle = 0;
    public serverData?: string|null;
    public clientData?: string|null;

    constructor(maxRounds: number = 3) {
        this.maxRounds = maxRounds
    }

    public nextStep() {
        return  (!this.serverHandle)                    ? HandshakeStep.InitServer :
                (!this.clientHandle)                    ? HandshakeStep.InitClient :
                (!this.clientData && this.serverData)   ? HandshakeStep.ContinueClient :
                (!this.serverData && this.clientData)   ? HandshakeStep.ContinueServer :
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
