import { CardsApi } from './api';

describe("CardsApi: ", ()=>{

    let api: CardsApi;

    beforeEach(()=>{
        api = new CardsApi();
    })

    it("must enumerate readers", async ()=>{
        const devices = await api.enumerateReaders();
        expect(devices.length).toBeGreaterThanOrEqual(1);
    })

    it("must enumerate cards", async ()=>{
        const cards = await api.enumerateCards();
        expect(cards.length).toBeGreaterThanOrEqual(1);
    })

    it("must get card info", async ()=>{
        const cards = await api.enumerateCards();
        expect(cards.length).toBeGreaterThanOrEqual(1);
        const devices = await api.enumerateReaders();
        expect(devices.length).toBeGreaterThanOrEqual(1);
        const info = await api.getCardInfo(devices[0]);
        expect(info).toEqual(cards[0]);
    })

    it("must fail", async ()=>{
        expectAsync(api.getCardInfo("NonexistentID")).toBeRejected();
    })

})
