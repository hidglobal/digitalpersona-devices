import { FingerprintsApi } from './api';
import { User, AuthService } from '@digitalpersona/access-management';

describe("FingerprintsApi: ", () => {

    let api: FingerprintsApi;
    beforeEach(()=>{
        api = new FingerprintsApi(
            new WebSdk.WebChannelOptions({debug: false, reconnectAlways: true }),
            new AuthService("https://websvr-12-64.alpha.local/DPWebAuth/DPWebAuthService.svc")
        );
    })

    it("must enumerate devices", async ()=>{
        const devices = await api.enumerateDevices();
        expect(devices.length).toBeGreaterThanOrEqual(1);
    })

    it("must obtain Device info", async()=> {
        const devices = await api.enumerateDevices();
        const info = await api.getDeviceInfo(devices[0]);
        expect(info).toBeDefined();
        expect(info!.DeviceID).toBeDefined();
        expect(info!.eDeviceModality).toBeDefined();
        expect(info!.eDeviceTech).toBeDefined();
        expect(info!.eUidType).toBeDefined();
    })

    it("must fail", async ()=>{
        expectAsync(api.getDeviceInfo("NonexistentID")).toBeRejected();
    })

    it("must get enrolled fingers", async() => {
        const fingers = await api.getEnrollmentData(new User("alpha\\administrator"));
        expect(fingers.length).toBeGreaterThan(0);
    })
})
