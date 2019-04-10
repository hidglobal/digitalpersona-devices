import { IAuthService, IEnrollService, JSONWebToken } from '@digitalpersona/access-management'

export class Enroller
{
    constructor(
        private readonly authService: IAuthService,
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken
    ){}

}
