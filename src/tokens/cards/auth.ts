import { User, IAuthService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { SmartCard, ContactlessCard, ProximityCard } from './data';
import { authenticate } from '../workflows';

class CardsAuth<Cred extends Credential> {
    constructor(
        protected readonly Cred: (new(data: string) => Cred),
        protected readonly authServer: IAuthService,
    ){
        if (!this.authServer)
            throw new Error("authServer");
    }

    // Authenticates the user using the card.
    // For contactless/proximity cards this method is usually called on tap (from the onCardInserted event handler).
    // For smart cards this method is usually called when the user types and submits a PIN.
    public authenticate(identity: User|JSONWebToken, cardData: string): Promise<JSONWebToken>
    {
        return authenticate(identity, new this.Cred(cardData), this.authServer);
    }
}

export class SmartCardAuth extends CardsAuth<SmartCard>
{
    constructor(authServer: IAuthService) {
        super(SmartCard, authServer)
    }
}

export class ContactlessCardAuth extends CardsAuth<ContactlessCard>
{
    constructor(authServer: IAuthService){
        super(ContactlessCard, authServer);
    }
}

export class ProximityCardAuth extends CardsAuth<ProximityCard>
{
    constructor(authServer: IAuthService){
        super(ProximityCard, authServer);
    }
}
