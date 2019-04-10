import * as u2fApi from 'u2f-api';
import { User, Credential, JSONWebToken, Base64Url, Ticket, IEnrollService } from '@digitalpersona/access-management';
import { U2F } from './credential';

export class U2FEnroll
{
    private static TIMEOUT = 20;
    private static TIME_WINDOW = 30;


    constructor(
        private readonly appId: string,
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){
        if (!appId)
            throw new Error("appId");
        if (!enrollService)
            throw new Error("enrollService");
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.U2F
        )
    }

    public enroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        const timestamp = Math.round(new Date().getTime() / (U2FEnroll.TIME_WINDOW * 1000));
        const challenge = Base64Url.fromUtf16(timestamp.toString());

        const registerRequests: u2fApi.RegisterRequest[] = [{
            version: "U2F_V2",
            appId: this.appId,
            challenge
        }];
        return u2fApi
            .register(registerRequests, [], U2FEnroll.TIMEOUT)
            .then(response => this.enrollService!.EnrollUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new U2F(this.appId, response)));
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService
            .DeleteUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new U2F(this.appId)
            )
    }

}
