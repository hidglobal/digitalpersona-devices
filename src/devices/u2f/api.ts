import * as u2fApi from 'u2f-api';
import { User, Credential, JSONWebToken, IAuthService, AuthenticationStatus, Base64UrlString, Utf16, Base64Url } from '@digitalpersona/access-management';
import { Handler, MultiCastEventSource } from '../../private';
import { CommunicationEventSource, CommunicationFailed  } from '../../common';
import { AuthenticationContext, AuthenticationStep, AuthenticationData } from '../../private/workflow';
import { HandshakeData, HandshakeType } from './data';

export class U2F
    extends MultiCastEventSource
    implements CommunicationEventSource
{
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        super();
        this.authService = authService;
    }

    public onCommunicationFailed: Handler<CommunicationFailed>;

    public on<E extends Event>(event: string, handler: Handler<E>): this { return this._on(event, handler); }
    public off<E extends Event>(event: string, handler: Handler<E>): this { return this._off(event, handler); }

    public authenticate(user: User){
        const _this = this;

        // Performs one step in an authentication workflow and recursively calls itself for a next step.
        // The workflow finishes when a token obtained, or an error produced.
        // Note that for a proper cleanup sequence the promise must always succeed and never be rejected!
        // The error must be passed to the caller in the `result` property of the `context` (see `.withError()`)
        // and must be extracted and thrown by the caller.
        const nextStep = (context: AuthenticationContext): Promise<AuthenticationContext> =>
        {
            switch(context.nextStep())
            {
                case AuthenticationStep.InitClient: { return _this
                    .init()
                    .then(data => nextStep(context.withClientHandle(data.handle).withClientData(data.data)));
                }
                case AuthenticationStep.InitServer: { return _this
                    .authService.CreateUserAuthentication(context.user, context.credentialId)
                    .then(handle => nextStep(context.withServerHandle(handle)));
                }
                case AuthenticationStep.ContinueClient: { return _this
                    .continue(context.clientHandle, context.serverData!)
                    .then(clientData => nextStep(context.withClientData(clientData)));
                }
                case AuthenticationStep.ContinueServer: { return _this
                    .authService.ContinueAuthentication(context.serverHandle, context.clientData!)
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
                case AuthenticationStep.Done: {
                    if (context.clientHandle) _this.term(context.clientHandle);                                 // ignore the outcome
                    if (context.serverHandle) _this.authService.DestroyAuthentication(context.serverHandle);    // ignore the outcome
                    return Promise.resolve(context);   // must always resolve, even if result is an error
                }
                case AuthenticationStep.AttemptsDepleted: {
                    return nextStep(context.withError(new Error("Authentication stalled")));
                }
                case AuthenticationStep.Error:
                default:
                    return nextStep(context.withError(new Error("Invalid authentication workflow state")));
            }
        }

        // Start the workflow and extract a token (or throw an error) when ready.
        let context = new AuthenticationContext(Credential.U2F, user);
        return nextStep(context).then(context => {
            if (context.result instanceof Error)
                throw context.result;
            return context.result as JSONWebToken;
        });
    }

    private init(): Promise<AuthenticationData> {
        const challenge = new HandshakeData();
        return Promise.resolve({
            handle: 1,  // a surrogate handle to show the initialization complete
            data: JSON.stringify(challenge)
        });
    }

    private continue(handle: number, data: string): Promise<Base64UrlString>
    {
        const handshake: HandshakeData = JSON.parse(Utf16.fromBase64Url(data));
        if (handshake.handshakeType != HandshakeType.SignRequest)
            return Promise.reject(new Error("Unexpected handshake type"));
        if (!handshake.handshakeData)
            return Promise.reject(new Error("No handshake data"));
        const signRequest: u2fApi.SignRequest = JSON.parse(Utf16.fromBase64Url(handshake.handshakeData));
        return u2fApi
            .sign(signRequest)
            .then(signResponse => {
                const handshakeData = JSON.stringify({
                    serialNum: "",
                    version: signRequest.version,
                    appId: signRequest.appId,
                    signatureData: signResponse.signatureData,
                    clientData: signResponse.clientData
                });
                var response: HandshakeData = {
                    handshakeType: HandshakeType.SignResponse,
                    handshakeData: Base64Url.fromUtf16(handshakeData)
                };
                return JSON.stringify(response);
            });
    }

    private term(handle: number): Promise<void> {
        // nothing to do, the handle is surrogate
        return Promise.resolve();
    }

}
