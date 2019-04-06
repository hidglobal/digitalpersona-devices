import * as u2fApi from 'u2f-api';
import { User, Credential, JSONWebToken, IAuthService, Base64UrlString, Utf16, Base64Url, Ticket, IEnrollService } from '@digitalpersona/access-management';
import { Handler, MultiCastEventSource } from '../../private';
import { CommunicationEventSource, CommunicationFailed  } from '../../common';
import { AuthenticationData, IAuthenticationClient, authenticate } from '../../private/workflows';
import { HandshakeData, HandshakeType } from './data';
import { CustomAction, U2FAppId } from './actions';
import { U2F } from './credential';

export class U2FApi
    extends MultiCastEventSource
    implements CommunicationEventSource
{
    private impl: U2FImpl = new U2FImpl();
    private static TIMEOUT = 20;
    private static TIME_WINDOW = 30;

    constructor(
        public readonly appId: string,
        private readonly authService: IAuthService,
        private readonly enrollService?: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){
        super();
    }

    public onCommunicationFailed: Handler<CommunicationFailed>;

    public on<E extends Event>(event: string, handler: Handler<E>): this { return this._on(event, handler); }
    public off<E extends Event>(event: string, handler: Handler<E>): this { return this._off(event, handler); }

    public static isSupported(): Promise<boolean> {
        return u2fApi.isSupported();
    }

    public authenticate(user: User): Promise<JSONWebToken> {
        return authenticate(user, Credential.U2F, this.authService, this.impl);
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.U2F
        )
    }

    public getAppId(): Promise<string> {
        return this.authService
            .CustomAction(CustomAction.RequestAppId, Ticket.None(), User.Anonymous(), new Credential(Credential.U2F, ""))
            .then(data =>
                (JSON.parse(data) as U2FAppId).AppId);
    }


    public enroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));

        const timestamp = Math.round(new Date().getTime() / (U2FApi.TIME_WINDOW * 1000));
        const challenge = Base64Url.fromUtf16(timestamp.toString());

        const registerRequests: u2fApi.RegisterRequest[] = [{
            version: "U2F_V2",
            appId: this.appId,
            challenge
        }];
        return u2fApi
            .register(registerRequests, [], U2FApi.TIMEOUT)
            .then(response => this.enrollService!.EnrollUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new U2F(this.appId, response)));
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService
            .DeleteUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new U2F(this.appId)
            )
    }

}


class U2FImpl
    implements IAuthenticationClient
{
    public init(): Promise<AuthenticationData> {
        const challenge = new HandshakeData();
        return Promise.resolve({
            handle: 1,  // a surrogate handle to show the initialization complete
            data: JSON.stringify(challenge)
        });
    }

    public continue(handle: number, data: string): Promise<Base64UrlString>
    {
        const handshake: HandshakeData = JSON.parse(data);
        if (handshake.handshakeType != HandshakeType.ChallengeResponse)
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
                    handshakeType: HandshakeType.AuthenticationRequest,
                    handshakeData: Base64Url.fromUtf16(handshakeData)
                };
                return JSON.stringify(response);
            })
    }

    public term(handle: number): Promise<void> {
        // nothing to do, the handle is surrogate
        return Promise.resolve();
    }

}
