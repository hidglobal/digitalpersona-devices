import { Credential, Base64Url } from "@digitalpersona/access-management";

export class Password extends Credential
{
    constructor(password: string, oldPassword?: string|null) {
        super(Credential.Password, Base64Url.fromUtf16(JSON.stringify(
            typeof oldPassword !== 'undefined'
                ? { oldPassword, newPassword: password }    // password change/reset
                : password                                  // password authentication
        )));
    }
}
