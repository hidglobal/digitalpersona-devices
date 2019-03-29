import { Base64UrlString } from "@digitalpersona/access-management";

type ClientDataType = "navigator.id.getAssertion" | "navigator.id.finishEnrollment"

export class ClientData
{
    public readonly typ: ClientDataType;
    public readonly challenge: Base64UrlString;
    public readonly origin: string;

    private constructor(type: ClientDataType, challenge: Base64UrlString, origin: string)
    {
        this.typ = type;
        this.challenge = challenge;
        this.origin = origin;
    }

    public forAuthentication(challenge: string, origin: string)
    {
        return new ClientData("navigator.id.getAssertion", challenge, origin);
    }
    public forEnrollment(challenge: Base64UrlString, origin: string)
    {
        return new ClientData("navigator.id.finishEnrollment", challenge, origin);
    }
}

export const enum HandshakeType
{
    Init = 0,
    SignRequest = 1,
    SignResponse = 2
}


export class HandshakeData
{
    public handshakeType: HandshakeType = HandshakeType.Init ;
    public handshakeData: string|null;
}
