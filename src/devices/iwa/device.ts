import { Base64UrlString } from '@digitalpersona/access-management';
import { Handler, MultiCastEventSource } from '../../private';
import { Command, Request, Channel } from '../websdk'
import { CommunicationEventSource, CommunicationFailed  } from '../../common';
import { Method } from './messages';
import { IWAData } from './data';
import { AuthenticationData, IAuthenticationClient } from '../../tokens/workflows';

export class WindowsAuth
    extends MultiCastEventSource
    implements CommunicationEventSource, IAuthenticationClient

{
    private channel: Channel;

    public onCommunicationFailed: Handler<CommunicationFailed>;

    public on<E extends Event>(event: string, handler: Handler<E>): this { return this._on(event, handler); }
    public off<E extends Event>(event: string, handler: Handler<E>): this { return this._off(event, handler); }

    constructor(options?: WebSdk.WebChannelOptions) {
        super();
        this.channel = new Channel("wia", options);
        this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
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

    private onConnectionFailed(): void {
        this.emit(new CommunicationFailed());
    }

}
