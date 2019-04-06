import { Env } from './../../test'
import { U2F } from './../u2f';
import { AuthService, User } from '@digitalpersona/access-management';

describe("U2F Token: ", ()=>
{
    let api: U2F;

    const user: User = new User("alpha\\administrator");

    beforeEach(()=>{
        api = new U2F(new AuthService(Env.AuthServerEndpoint));
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
