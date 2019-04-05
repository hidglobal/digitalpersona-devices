import { User, Base64Url, Utf8, IAuthService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { Handler, MultiCastEventSource, Command, Request, Channel } from '../../private';
import { CommunicationFailed, CommunicationEventSource } from '../../common';
import { DeviceConnected, DeviceDisconnected, DeviceEventSource } from '../events'
import { ErrorOccurred,
    SamplesAcquired, QualityReported,
    AcquisitionStarted, AcquisitionStopped
} from './events';
import { FingerprintsEventSource } from './eventSource';
import { Method, NotificationType, Notification, EnumerateDevicesResponse, Completed, Error, Quality } from './messages';
import { DeviceInfo } from './device';
import { SampleFormat } from './sample';
import { FingerEnrollment, FingerEnrollmentData } from './data';

export class FingerprintsApi
    extends MultiCastEventSource
    implements FingerprintsEventSource, DeviceEventSource, CommunicationEventSource
{
    private readonly channel: Channel;
    private readonly server?: IAuthService;

    public onDeviceConnected: Handler<DeviceConnected>;
    public onDeviceDisconnected: Handler<DeviceDisconnected>;
    public onSamplesAcquired: Handler<SamplesAcquired>;
    public onQualityReported: Handler<QualityReported>;
    public onErrorOccurred: Handler<ErrorOccurred>;
    public onAcquisitionStarted: Handler<AcquisitionStarted>;
    public onAcquisitionStopped: Handler<AcquisitionStopped>;
    public onCommunicationFailed: Handler<CommunicationFailed>;

    public on<E extends Event>(event: string, handler: Handler<E>): this { return this._on(event, handler); }
    public off<E extends Event>(event: string, handler: Handler<E>): this { return this._off(event, handler); }

    constructor(options?: WebSdk.WebChannelOptions, server?: IAuthService) {
        super();
        this.channel = new Channel("fingerprints", options);
        this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
        this.channel.onNotification = this.processNotification.bind(this);
        this.server = server;
    }

    // Authenticates the user and returns a JSON Web Token.
    // Call this method when the fingerprint reader captures a biometric sample
    public authenticate(user: User, data: SamplesAcquired): Promise<JSONWebToken> {
        if (!this.server)
            return Promise.reject(new Error("Server"));
        return this.server
            .AuthenticateUser(user, new Credential(Credential.Fingerprints, Base64Url.fromUtf8(data.samples)))
            .then(ticket => ticket.jwt);
    }

    public identiy(data: SamplesAcquired): Promise<JSONWebToken> {
        if (!this.server)
            return Promise.reject(new Error("Server"));
        return this.server
            .IdentifyUser(new Credential(Credential.Fingerprints, Base64Url.fromUtf8(data.samples)))
            .then(ticket => ticket.jwt);
    }

    public getEnrollmentData(user: User): Promise<FingerEnrollmentData>
    {
        if (!this.server)
            return Promise.reject(new Error("Server"));
        return this.server
            .GetEnrollmentData(user, Credential.Fingerprints)
            .then(data =>
                (JSON.parse(Utf8.fromBase64Url(data)) as object[]).map(item => FingerEnrollment.fromJson(item))
            );
    }

    public enumerateDevices(): Promise<string[]> {
        return this.channel.send(new Request(new Command(
            Method.EnumerateDevices
        )))
        .then(response => {
            if (!response) return [];
            var deviceList: EnumerateDevicesResponse = JSON.parse(Utf8.fromBase64Url(response.Data || "{}"));
            return JSON.parse(deviceList.DeviceIDs || "[]");
        })
    }

    public getDeviceInfo(deviceUid: string): Promise<DeviceInfo|null> {
        return this.channel.send(new Request(new Command(
            Method.GetDeviceInfo,
            Base64Url.fromUtf16(JSON.stringify({ DeviceID: deviceUid }))
        )))
        .then(response => {
            var deviceInfo: DeviceInfo = JSON.parse(Utf8.fromBase64Url(response.Data || "null"));
            return deviceInfo;
        })
    }

    public startAcquisition(sampleFormat: SampleFormat, deviceUid?: string): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.StartAcquisition,
            Base64Url.fromUtf16(JSON.stringify({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
                SampleType: sampleFormat
            }))
        )))
        .then(() => {});
    }

    public stopAcquisition(deviceUid?: string): Promise<void> {
        return this.channel.send(new Request(new Command(
            Method.StopAcquisition,
            Base64Url.fromUtf16(JSON.stringify({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000"
            }))
        )))
        .then(() => {});
    }

    private onConnectionFailed(): void {
        this.emit(new CommunicationFailed());
    }

    private processNotification(notification: Notification): void {
        switch(notification.Event) {
            case NotificationType.Completed:
                const completed: Completed = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new SamplesAcquired(notification.Device, completed.SampleFormat, completed.Samples));
            case NotificationType.Error:
                const error: Error = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new ErrorOccurred(notification.Device, error.uError));
            case NotificationType.Disconnected:
                return this.emit(new DeviceDisconnected(notification.Device));
            case NotificationType.Connected:
                return this.emit(new DeviceConnected(notification.Device));
            case NotificationType.Quality:
                const quality: Quality = JSON.parse(Utf8.fromBase64Url(notification.Data || ""));
                return this.emit(new QualityReported(notification.Device, quality.Quality));
            case NotificationType.Stopped :
                return this.emit(new AcquisitionStopped(notification.Device));
            case NotificationType.Started:
                return this.emit(new AcquisitionStarted(notification.Device));
            default:
                console.log(`Unknown notification: ${notification.Event}`)
        }
    }
}
