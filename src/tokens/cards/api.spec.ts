import { CardsReader, Card } from '../../devices';
import { CardsApi } from './api';
import { Env } from './../../test';
import { User, AuthService, EnrollService } from '@digitalpersona/access-management';

describe("CardsApi: ", ()=>
{
    let reader: CardsReader;
    let api: CardsApi;

    const user: User = new User("alpha\\administrator");

    beforeEach(()=>{
        reader = new CardsReader();
        api = new CardsApi(
            reader,
            new AuthService(Env.AuthServerEndpoint),
            new EnrollService(Env.EnrollServerEndpoint)
        );
    })

})
