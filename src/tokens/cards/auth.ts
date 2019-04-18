import { User, IAuthService, JSONWebToken, Credential } from '@digitalpersona/access-management';
import { SmartCard, ContactlessCard, ProximityCard } from './credential';
import { Authenticator } from '../workflows';

export class SmartCardAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    // Authenticates the user using the card.
    // For contactless/proximity cards this method is usually called on tap (from the onCardInserted event handler).
    // For smart cards this method is usually called when the user types and submits a PIN.
    public authenticate(identity: User|JSONWebToken, cardData: string): Promise<JSONWebToken>
    {
        return super._authenticate(identity, new SmartCard(cardData));
    }
}

export class ContactlessCardAuth extends Authenticator
{
    constructor(authService: IAuthService){
        super(authService);
    }
    // Authenticates the user using the card.
    // For contactless/proximity cards this method is usually called on tap (from the onCardInserted event handler).
    // For smart cards this method is usually called when the user types and submits a PIN.
    public authenticate(identity: User|JSONWebToken, cardData: string): Promise<JSONWebToken>
    {
        return super._authenticate(identity, new ContactlessCard(cardData));
    }

    public identify(cardData: string): Promise<JSONWebToken>
    {
        return this.authService
            .IdentifyUser(new ContactlessCard(cardData))
            .then(ticket => ticket.jwt);
    }
}

export class ProximityCardAuth extends Authenticator
{
    constructor(authService: IAuthService){
        super(authService);
    }

    // Authenticates the user using the card.
    // For contactless/proximity cards this method is usually called on tap (from the onCardInserted event handler).
    // For smart cards this method is usually called when the user types and submits a PIN.
    public authenticate(identity: User|JSONWebToken, cardData: string): Promise<JSONWebToken>
    {
        return super._authenticate(identity, new ProximityCard(cardData));
    }
    public identify(cardData: string): Promise<JSONWebToken>
    {
        return this.authService
            .IdentifyUser(new ProximityCard(cardData))
            .then(ticket => ticket.jwt);
    }
}
