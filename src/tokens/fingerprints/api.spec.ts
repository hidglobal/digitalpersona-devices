import { Env } from './../../test';
import { FingerprintsApi } from './api';
import { User, AuthService } from '@digitalpersona/access-management';

describe("FingerprintsApi: ", () =>
{
    let api: FingerprintsApi;

    beforeEach(()=>{
        api = new FingerprintsApi(
            new WebSdk.WebChannelOptions({debug: Env.Trace, reconnectAlways: true }),
            new AuthService(Env.AuthServerEndpoint)
        );
    })

    it("must enumerate devices", async ()=>{
        if (!Env.Hardware) return;
        const devices = await api.enumerateDevices();
        expect(devices.length).toBeGreaterThanOrEqual(1);
    })

    it("must obtain Device info", async()=> {
        if (!Env.Hardware) return;
        const devices = await api.enumerateDevices();
        const info = await api.getDeviceInfo(devices[0]);
        expect(info).toBeDefined();
        expect(info!.DeviceID).toBeDefined();
        expect(info!.eDeviceModality).toBeDefined();
        expect(info!.eDeviceTech).toBeDefined();
        expect(info!.eUidType).toBeDefined();
    })

    it("must fail", async ()=>{
        if (!Env.Hardware) return;
        expectAsync(api.getDeviceInfo("NonexistentID")).toBeRejected();
    })

    it("must get enrolled fingers", async() => {
        if (!Env.Integration) return;
        const fingers = await api.getEnrollmentData(new User("alpha\\administrator"));
        expect(fingers.length).toBeGreaterThan(0);
    })
})
