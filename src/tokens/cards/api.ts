import { CardsReader, CardType, Card } from '../../devices';
import { authenticate } from '../workflows';
import { User, Ticket, Credential, CredentialId, IAuthService, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';

export class CardsApi
{
    constructor(
        private readonly reader: CardsReader,
        private readonly authServer?: IAuthService,
        private readonly enrollService?: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ) {
    }

    private credentialId(cardType: CardType): CredentialId {
        return  (cardType === CardType.Contactless) ? Credential.ContactlesCard :
                (cardType === CardType.Proximity) ? Credential.ProximityCard :
                (cardType === CardType.Contact) ? Credential.SmartCard :
                (()=>{throw new Error("Unsupporter card type")})();
}

    // Authenticates the user using the card.
    // For contactless/proximity cards this method is usually called on tap (from the onCardInserted event handler).
    // For smart cards this method is usually called when the user types and submits a PIN.
    public authenticate(user: User, card: Card, pin?: string): Promise<JSONWebToken>
    {
        if (!this.authServer)
            return Promise.reject(new Error("authServer"));

        return this.reader
            .getCardAuthData(card.Reader, pin)
            .then(data => authenticate(user, new Credential(this.credentialId(card.Type), data), this.authServer!));
    }

    public canEnroll(user: User, cardType: CardType, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            this.credentialId(cardType)
        )
    }

    public enroll(user: JSONWebToken, card: Card, pin?: string, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.reader
            .getCardEnrollData(card.Reader, pin)
            .then(data => this.enrollService!.EnrollUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new Credential(this.credentialId(card.Type), data)
            ));
    }

    public unenroll(user: JSONWebToken, cardType: CardType, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new Credential(this.credentialId(cardType), "")
        );
    }

}

