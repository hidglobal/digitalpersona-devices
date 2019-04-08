import { CardsReader, CardType } from '../../devices';
import { authenticate } from '../workflows';
import { User, Credential, IAuthService, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';

export class CardsApi
{
    constructor(
        private readonly reader: CardsReader,
        private readonly authServer?: IAuthService,
        private readonly enrollService?: IEnrollService,
    ) {
    }

    // Authenticates the user using the card.
    // For contactless/proximity cards this method is usually called on tap (from the onCardInserted event handler).
    // For smart cards this method is usually called when the user types and submits a PIN.
    public authenticate(user: User, reader: string, pin?: string): Promise<JSONWebToken>
    {
        if (!this.authServer)
            return Promise.reject(new Error("authServer"));
        return this.reader
            .getCardInfo(reader)
            .then(info => {
                if (!info)
                    return Promise.reject(new Error("Card is not enrolled"));
                const credId =
                    (info.Type === CardType.Contactless) ? Credential.ContactlesCard :
                    (info.Type === CardType.Proximity) ? Credential.ProximityCard :
                    (info.Type === CardType.Contact) ? Credential.SmartCard :
                    (()=>{throw new Error("Unsupporter card type")})();

                return this.reader
                    .getCardAuthData(reader, pin)
                    .then(data => authenticate(user, new Credential(credId, data), this.authServer!));
            })
    }

}

