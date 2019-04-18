import { Credential } from "@digitalpersona/access-management";

/**@internal */
export class SmartCard extends Credential
{
    constructor(cardData: string) {
        super(Credential.SmartCard, cardData, false);
    }
}

/**@internal */
export class ContactlessCard extends Credential
{
    constructor(cardData: string) {
        super(Credential.ContactlesCard, cardData, false);
    }
}

/**@internal */
export class ProximityCard extends Credential
{
    constructor(cardData: string) {
        super(Credential.ProximityCard, cardData, false);
    }
}
