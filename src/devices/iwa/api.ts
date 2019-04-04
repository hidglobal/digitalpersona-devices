import { Credential, JSONWebToken, IAuthService, Base64UrlString } from '@digitalpersona/access-management';
import { Handler, MultiCastEventSource, Command, Request, Channel } from '../../private';
import { CommunicationEventSource, CommunicationFailed  } from '../../common';
import { Method } from './messages';
import { IWAData } from './data';
import { AuthenticationData, IAuthenticationClient, authenticate } from '../../private/workflows/authentication';

export class WindowsAuthApi
    extends MultiCastEventSource
    implements CommunicationEventSource
{
    private authService: IAuthService;
    private impl: IWAImpl;

    public onCommunicationFailed: Handler<CommunicationFailed>;

    public on<E extends Event>(event: string, handler: Handler<E>): this { return this._on(event, handler); }
    public off<E extends Event>(event: string, handler: Handler<E>): this { return this._off(event, handler); }

    constructor(authService: IAuthService, options?: WebSdk.WebChannelOptions) {
        super();
        this.authService = authService;
        const channel = new Channel("fingerprints", options);
        channel.onCommunicationError = this.onConnectionFailed.bind(this);
        this.impl = new IWAImpl(channel);
    }

    public authenticate(): Promise<JSONWebToken> {
        return authenticate(null, Credential.IWA, this.impl, this.authService);
    }

    private onConnectionFailed(): void {
        this.emit(new CommunicationFailed());
    }

}
class IWAImpl
    implements IAuthenticationClient
{
    private channel: Channel;

    constructor(channel: Channel) {
        this.channel = channel;
    }

    public init(): Promise<AuthenticationData> {
        return this.channel.send(new Request(new Command(
            Method.Init
        )), 3000)
        .then(response => {
            var data: IWAData = JSON.parse(response.Data || "{}");
            return { handle: data.Handle, data: data.Data };
        });
    }

    public continue(handle: number, data: string): Promise<Base64UrlString> {
        return this.channel.send(new Request(new Command(
            Method.Continue,
            JSON.stringify({ Handle: handle, Data: data})
        )))
        .then(response => {
            var data: IWAData = JSON.parse(response.Data || "{}");
            return data.Data;
        });
    }

    public term(handle: number): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.Term,
            JSON.stringify({ Handle: handle })
        )))
        .then(() => {});
    }
}

