import { CardsApi } from './api';
import { Env } from './../../test';
import { User, AuthService } from '@digitalpersona/access-management';

describe("CardsApi: ", ()=>
{
    let api: CardsApi;

    beforeEach(()=>{
        api = new CardsApi(
            new WebSdk.WebChannelOptions({debug: Env.Trace, reconnectAlways: true }),
            new AuthService(Env.AuthServerEndpoint)
        );
    })

    it("must enumerate readers", async ()=>{
        if (!Env.Hardware) return;
        const devices = await api.enumerateReaders();
        expect(devices.length).toBeGreaterThanOrEqual(1);
    })

    it("must enumerate cards", async ()=>{
        if (!Env.Hardware) return;
        const cards = await api.enumerateCards();
        expect(cards.length).toBeGreaterThanOrEqual(1);
    })

    it("must get card info", async ()=>{
        if (!Env.Hardware) return;
        const cards = await api.enumerateCards();
        expect(cards.length).toBeGreaterThanOrEqual(1);
        const devices = await api.enumerateReaders();
        expect(devices.length).toBeGreaterThanOrEqual(1);
        const info = await api.getCardInfo(devices[0]);
        expect(info).toEqual(cards[0]);
    })

    it("must fail", async ()=>{
        if (!Env.Hardware) return;
        expectAsync(api.getCardInfo("NonexistentID")).toBeRejected();
    })

})
