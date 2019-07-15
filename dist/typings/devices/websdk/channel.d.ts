import { Request, Response } from './command';
import 'WebSdk';
/**@internal
 *
 */
export declare class Channel {
    private webChannel;
    private pending;
    onCommunicationError: () => void;
    onNotification: (notification: any) => void;
    constructor(channelName: string, options?: WebSdk.WebChannelOptions);
    send(request: Request, timeout?: number): Promise<Response>;
    private onConnectionSucceed;
    private onConnectionFailed;
    private onDataReceivedTxt;
    private processRequestQueue;
    private findRequest;
}
