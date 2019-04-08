import { CardsReader } from '../../devices';
import { CardsApi } from './api';
import { Env } from './../../test';
import { AuthService, EnrollService } from '@digitalpersona/access-management';

describe("CardsApi: ", ()=>
{
    let api: CardsApi;

    beforeEach(()=>{
        api = new CardsApi(
            new CardsReader(),
            new AuthService(Env.AuthServerEndpoint),
            new EnrollService(Env.EnrollServerEndpoint)
        );
    })

})
