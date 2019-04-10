import { SmartCardAuth } from './auth';
import { Env } from '../../test';
import { User, AuthService } from '@digitalpersona/access-management';

describe("CardsApi: ", ()=>
{
    let api: SmartCardAuth;

    const user: User = new User("alpha\\administrator");

    beforeEach(()=>{
        api = new SmartCardAuth(
            new AuthService(Env.AuthServerEndpoint),
        );
    })

})
