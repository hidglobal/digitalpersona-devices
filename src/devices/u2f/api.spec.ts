import { U2F } from './../u2f';
import { AuthService, User } from '@digitalpersona/access-management';

describe("U2F Token: ", ()=>
{

    let api: U2F;

    const user: User = new User("alpha\\administrator");

    beforeEach(()=>{
        api = new U2F(new AuthService('https://websvr-12-64.alpha.local/DPWebAUTH/DPWebAUTHService.svc'));
    })

    it("must authenticate", async ()=>{
        expectAsync(api.authenticate(user))
            .toBeRejected(); //.toBeResolved();
    });

})
