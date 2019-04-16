import { Credential } from "@digitalpersona/access-management";

export class PIN extends Credential
{
    constructor(pin: string) {
        super(Credential.PIN, pin);
    }
}
