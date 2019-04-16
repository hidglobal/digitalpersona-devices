import { User, IAuthService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { SmartCard, ContactlessCard, ProximityCard } from './credential';
import { Authenticator } from '../workflows';

class CardsAuth<Cred extends Credential> extends Authenticator {
    constructor(
        protected readonly Cred: (new(data: string) => Cred),
        protected readonly authService: IAuthService,
    ){
        super(authService);
    }

    // Authenticates the user using the card.
    // For contactless/proximity cards this method is usually called on tap (from the onCardInserted event handler).
    // For smart cards this method is usually called when the user types and submits a PIN.
    public authenticate(identity: User|JSONWebToken, cardData: string): Promise<JSONWebToken>
    {
        return super._authenticate(identity, new this.Cred(cardData));
    }
}

export class SmartCardAuth extends CardsAuth<SmartCard>
{
    constructor(authService: IAuthService) {
        super(SmartCard, authService)
    }
}

export class ContactlessCardAuth extends CardsAuth<ContactlessCard>
{
    constructor(authService: IAuthService){
        super(ContactlessCard, authService);
    }
    public identify(cardData: string): Promise<JSONWebToken>
    {
        return this.authService
            .IdentifyUser(new ContactlessCard(cardData))
            .then(ticket => ticket.jwt);
    }
}

export class ProximityCardAuth extends CardsAuth<ProximityCard>
{
    constructor(authService: IAuthService){
        super(ProximityCard, authService);
    }

    public identify(cardData: string): Promise<JSONWebToken>
    {
        return this.authService
            .IdentifyUser(new ProximityCard(cardData))
            .then(ticket => ticket.jwt);
    }
}
