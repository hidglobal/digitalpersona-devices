import { Env } from './../../test';
import { FingerprintReader } from './api';

describe("FingerprintsApi: ", () =>
{
    let api: FingerprintReader;

    beforeEach(()=>{
        api = new FingerprintReader(
            new WebSdk.WebChannelOptions({debug: Env.Trace, reconnectAlways: true }),
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
})
