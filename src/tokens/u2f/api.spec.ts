import { Env } from './../../test'
import { U2FApi } from './../u2f';
import { AuthService, User, EnrollService } from '@digitalpersona/access-management';

describe("U2F Token: ", ()=>
{
    let api: U2FApi;

    const appId: string = Env.Domain;
    const user: User = new User("alpha\\administrator");

    beforeEach(()=>{
        api = new U2FApi(
            appId,
            new AuthService(Env.AuthServerEndpoint),
            new EnrollService(Env.EnrollServerEndpoint)
        );
    })

    it("must authenticate", async ()=>{
        if (!Env.Integration) return;
        expectAsync(api.authenticate(user))
            .toBeRejected(); //.toBeResolved();
    });

    it("must get AppID", async ()=>{
        if (!Env.Integration) return;
        const appid = await api.getAppId();
        expect(appid).toBe(Env.AppId);
    })

})
