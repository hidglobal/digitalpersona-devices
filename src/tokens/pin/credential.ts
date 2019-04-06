import { Credential, Base64Url } from "@digitalpersona/access-management";

export class PIN extends Credential
{
    constructor(pin: string) {
        super(Credential.PIN, Base64Url.fromUtf16(pin));
    }
}
