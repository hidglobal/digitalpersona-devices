import { Env } from './../../test';
import { FingerprintsApi } from './api';
import { User, AuthService, EnrollService } from '@digitalpersona/access-management';

describe("FingerprintsApi: ", () =>
{
    let api: FingerprintsApi;

    beforeEach(()=>{
        api = new FingerprintsApi(
            new AuthService(Env.AuthServerEndpoint),
            new EnrollService(Env.EnrollServerEndpoint),
        );
    })

    it("must get enrolled fingers", async() => {
        if (!Env.Integration) return;
        const fingers = await api.getEnrolled(new User("alpha\\administrator"));
        expect(fingers.length).toBeGreaterThan(0);
    })
})
