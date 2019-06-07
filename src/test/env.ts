export class Env
{
    public static Integration = false;  // enables integration tests. Must have Web Components configured for Domain
    public static Hardware = false;     // enables hardware tests. Must have all devices connected.
    public static Trace = false;        // enabled detailed tracing

    public static Domain = "websvr-12-64.alpha.local";

    public static get AppId() {
        return `https://${Env.Domain}/DPFido/app-id.json`;
    }
    public static get AuthServerEndpoint() {
        return `https://${Env.Domain}/DPWebAUTH/DPWebAUTHService.svc`;
    }
    public static get EnrollServerEndpoint() {
        return `https://${Env.Domain}/DPWebEnroll/DPWebEnrollService.svc`;
    }
}
