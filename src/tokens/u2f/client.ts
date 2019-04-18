import * as u2fApi from 'u2f-api';
import { Base64UrlString, Utf16, Base64Url } from '@digitalpersona/access-management';
import { AuthenticationData, IAuthenticationClient } from '../workflows';
import { HandshakeData, HandshakeType } from './data';

/**@internal
 *
 * Implements the client's part of the U2F handshake protocol.
 */
export class U2FClient
    implements IAuthenticationClient
{
    public init(): Promise<AuthenticationData> {
        const challenge = new HandshakeData();
        return Promise.resolve({
            handle: 1,  // a surrogate handle to show the initialization complete
            data: JSON.stringify(challenge)
        });
    }

    public continue(handle: number, data: string): Promise<Base64UrlString>
    {
        const handshake: HandshakeData = JSON.parse(data);
        if (handshake.handshakeType != HandshakeType.ChallengeResponse)
            return Promise.reject(new Error("Unexpected handshake type"));
        if (!handshake.handshakeData)
            return Promise.reject(new Error("No handshake data"));
        const signRequest: u2fApi.SignRequest = JSON.parse(Utf16.fromBase64Url(handshake.handshakeData));
        return u2fApi
            .sign(signRequest)
            .then(signResponse => {
                const handshakeData = JSON.stringify({
                    serialNum: "",
                    version: signRequest.version,
                    appId: signRequest.appId,
                    signatureData: signResponse.signatureData,
                    clientData: signResponse.clientData
                });
                var response: HandshakeData = {
                    handshakeType: HandshakeType.AuthenticationRequest,
                    handshakeData: Base64Url.fromUtf16(handshakeData)
                };
                return JSON.stringify(response);
            })
    }

    public term(handle: number): Promise<void> {
        // nothing to do, the handle is surrogate
        return Promise.resolve();
    }

}
