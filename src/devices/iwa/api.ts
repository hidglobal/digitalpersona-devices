import { Credential, JSONWebToken, IAuthService, AuthenticationStatus, Base64UrlString } from '@digitalpersona/access-management';
import { Handler, MultiCastEventSource, Command, Request, Channel } from '../../private';
import { CommunicationEventSource, CommunicationFailed  } from '../../common';
import { Method } from './messages';
import { IWAData } from './data';
import { AuthenticationContext, AuthenticationData } from '../../private/workflow';

export class WindowsAuthApi
    extends MultiCastEventSource
    implements CommunicationEventSource
{
    private channel: Channel;
    private authService: IAuthService;

    public onCommunicationFailed: Handler<CommunicationFailed>;

    public on<E extends Event>(event: string, handler: Handler<E>): this { return this._on(event, handler); }
    public off<E extends Event>(event: string, handler: Handler<E>): this { return this._off(event, handler); }

    constructor(authService: IAuthService, options?: WebSdk.WebChannelOptions) {
        super();
        this.authService = authService;
        this.channel = new Channel("fingerprints", options);
        this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
    }

    public authenticate(): Promise<JSONWebToken> {
        const _this = this;

        // Performs one step in an authentication workflow and recursively calls itself for a next step.
        // The workflow finishes when a token obtained, or an error produced.
        // Note that for a proper cleanup sequence the promise must always succeed and never be rejected!
        // The error must be passed to the caller in the `result` property of the `context` (see `.withError()`)
        // and must be extracted and thrown by the caller.
        const nextStep = (context: AuthenticationContext): Promise<AuthenticationContext> =>
        {
            if (context.result) {
                if (context.clientHandle) _this.term(context.clientHandle);                                 // ignore the outcome
                if (context.serverHandle) _this.authService.DestroyAuthentication(context.serverHandle);    // ignore the outcome
                return Promise.resolve(context);    // must always resolve, even on error
            }

            if (context.attempts <= 0)
                nextStep(context.withError(new Error("Authentication stalled")));

            if (!context.serverHandle)   // init on server
                return _this.authService.CreateUserAuthentication(context.user, context.credentialId)
                    .then(handle => nextStep(context.withServerHandle(handle)));

            if (!context.clientHandle)   // init on client
                return _this.init()
                    .then(data => nextStep(context.withClientHandle(data.handle).withClientData(data.data)));

            if (!context.clientData && context.serverData)    // continue on client
                return _this.continue(context.clientHandle, context.serverData)
                    .then(clientData => nextStep(context.withClientData(clientData)));

            if (!context.serverData && context.clientData) { // continue on server
                return _this.authService
                    .ContinueAuthentication(context.serverHandle, context.clientData)
                    .then(result => {
                        switch (result.status) {
                            case AuthenticationStatus.Error:
                                return nextStep(context.withError(new Error("Authentication failed")));
                            case AuthenticationStatus.Continue:
                                return nextStep(context.withServerData(result.authData))
                            case AuthenticationStatus.Completed:
                                return nextStep(context.withToken(result.jwt));
                        }
                    });
            }
            return nextStep(context.withError(new Error("Invalid authentication workflow state")));
        }

        // Start the workflow and extract a token (or throw an error) when ready.
        let context = new AuthenticationContext(Credential.IWA, null);
        return nextStep(context).then(context => {
            if (context.result instanceof Error)
                throw context.result;
            return context.result as JSONWebToken;
        });
    }

    private onConnectionFailed(): void {
        this.emit(new CommunicationFailed());
    }

    private init(): Promise<AuthenticationData> {
        return this.channel.send(new Request(new Command(
            Method.Init
        )), 3000)
        .then(response => {
            var data: IWAData = JSON.parse(response.Data || "{}");
            return { handle: data.Handle, data: data.Data };
        });
    }

    private continue(handle: number, data: string): Promise<Base64UrlString> {
        return this.channel.send(new Request(new Command(
            Method.Continue,
            JSON.stringify({ Handle: handle, Data: data})
        )))
        .then(response => {
            var data: IWAData = JSON.parse(response.Data || "{}");
            return data.Data;
        });
    }

    private term(handle: number): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.Term,
            JSON.stringify({ Handle: handle })
        )))
        .then(() => {});
    }

}

