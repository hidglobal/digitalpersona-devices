import { User, Ticket, Credential, CredentialId, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';
import { SmartCard, ContactlessCard, ProximityCard } from './credential';

class CardEnroll<Cred extends Credential>
{
    constructor(
        protected readonly credId: CredentialId,
        protected readonly Cred: (new(data: string) => Cred),
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){
        if (!enrollService)
            throw new Error("enrollService");
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            this.credId
        )
    }

    public enroll(user: JSONWebToken, cardData: string, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new this.Cred(cardData)
        );
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new this.Cred("")
        );
    }
}

export class SmartCardEnroll extends CardEnroll<SmartCard>
{
    constructor(enrollService: IEnrollService, securityOfficer?: JSONWebToken) {
        super(Credential.SmartCard, SmartCard, enrollService, securityOfficer)
    }
}

export class ContactlessCardEnroll extends CardEnroll<ContactlessCard>
{
    constructor(enrollService: IEnrollService, securityOfficer?: JSONWebToken) {
        super(Credential.ContactlesCard, ContactlessCard, enrollService, securityOfficer);
    }
}

export class ProximityCardEnroll extends CardEnroll<ProximityCard>
{
    constructor(enrollService: IEnrollService, securityOfficer?: JSONWebToken) {
        super(Credential.ProximityCard, ProximityCard, enrollService, securityOfficer);
    }
}

