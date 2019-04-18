import { User, IAuthService, IPolicyService, CredentialId, ResourceActions, ContextualInfo, Policy, JSONWebToken, JWT } from '@digitalpersona/access-management'
import { WindowsAuthClient } from './devices';

/*
@category Authentication
*/
export class Authenticator
{
    private static windowsAuthClient = new WindowsAuthClient();

    constructor(
        private readonly authService: IAuthService,
        private readonly policyService: IPolicyService,
    ){}

    public getEnrolledCredentials(user: User): Promise<CredentialId[]>
    {
        return this.authService
            .GetUserCredentials(user)
            .then(creds => creds.map(c => c.toUpperCase()));
    }

    private static getNextAvailable(token: JSONWebToken, allAvailable: CredentialId[], policyList: Policy[]): CredentialId[]
    {
        // extract all creds already used from the token's claim
        const claims = JWT.claims(token);
        const used = (claims.crd || []).map(c => c.id.toUpperCase());

        // transform policy elements into an OR-array of AND-arrays of credentials
        const or = policyList.map(pe => pe.policy.map(p => p.cred_id));

        // exclude all AND-elements of the policy which do not contain available credentials
        const feasiblePolicies = or.filter(and => !and.some(c => allAvailable.indexOf(c) === -1))

        // flatten feasibles rules to a list of credentials
        const flattened: CredentialId[] = [].concat.apply([], feasiblePolicies);

        const next = flattened.sort()
            .filter(c => used.indexOf(c) < 0)                   // remove used
            .filter((item, i, arr) => !i || item !== arr[i-1])  // remove duplicates

        return next;
    }

}
