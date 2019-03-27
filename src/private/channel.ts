import { Base64Url, Utf8 } from '@digitalpersona/access-management';
import { Request, Response } from './command';
import { MessageType, Message } from './messages';

export class Channel
{
    private webChannel: WebSdk.WebChannelClient;
    private pending: Request[] = [];

    public onCommunicationError: () => void;
    public onNotification: (notification: any) => void;

    constructor(channelName: string, options?: WebSdk.WebChannelOptions) {
        this.webChannel = new WebSdk.WebChannelClient(channelName, options);
        this.webChannel.onConnectionSucceed = this.onConnectionSucceed;
        this.webChannel.onConnectionFailed = this.onConnectionFailed;
        this.webChannel.onDataReceivedTxt = this.onDataReceivedTxt;
    }

    public send(request: Request, timeout?: number): Promise<Response> {
        const deferred = new Promise<Response>((resolve, reject) => {
            request.resolve = resolve;
            request.reject = reject;
            if (timeout) {
                request.timer = window.setTimeout(() => {
                    if (request.timer) try {
                        request.reject(new Error("Timeout"));
                    } catch(e){}
                }, timeout);
            }
            });
        this.pending.push(request);
        if (this.webChannel.isConnected())
            this.processRequestQueue();
        else
            this.webChannel.connect();
        return deferred;
    }

    private onConnectionSucceed(): void {
        this.processRequestQueue();
    }

    private onConnectionFailed(): void {
        this.pending.forEach(r => r.reject(new Error("Communication failure.")));
        this.pending = [];
        if (this.onCommunicationError) try {
            this.onCommunicationError();
        } catch(e){}
    }

    private onDataReceivedTxt(data: string): void {
        const message: Message = JSON.parse(Utf8.fromBase64Url(data));
        if (message.Type === MessageType.Response) {
            const response: Response = JSON.parse(Utf8.fromBase64Url(message.Data));
            const request = this.findRequest(response);
            if (request !== null) {
                if (request.timer) {
                    window.clearTimeout(request.timer);
                    delete request.timer;
                }
                const hr = (response.Result >>> 0);
                if (hr > 0x7FFFFFFF)
                    request.reject(new Error(`0x${hr.toString(16)}`));
                else
                    request.resolve();
            } else
                console.log(`Orphaned response: ${message.Type}`);
        }
        else if (message.Type === MessageType.Notification) {
            const notification = JSON.parse(Utf8.fromBase64Url(message.Data));
            if (this.onNotification) try {
                this.onNotification(notification);
            } catch(e){}
        } else
            console.log(`Unknown message type: ${message.Type}`);
    }

    private processRequestQueue(): void {
        this.pending.forEach((req, i, items) => {
            if (!req.sent) {
                this.webChannel.sendDataTxt(Base64Url.fromUtf16(JSON.stringify(req.command)));
                items[i].sent = true;
            }
        })
    }

    private findRequest(response: Response): Request | null {
        for (var i = 0; i < this.pending.length; i++) {
            const request = this.pending[i];
            if (request.sent && (request.command.Method === response.Method)) {
                this.pending.splice(i, 1);
                return request;
            }
        }
        return null;
    }
}

