import { FingerprintsApi } from './api';

describe("FingerprintsApi: ", () => {

    let api: FingerprintsApi;
    beforeEach(()=>{
        api = new FingerprintsApi(new WebSdk.WebChannelOptions({debug: true, reconnectAlways: true }));
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
})
