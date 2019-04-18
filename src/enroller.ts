import { IAuthService, IEnrollService, JSONWebToken } from '@digitalpersona/access-management'

/*
@category Enrollment
*/
export abstract class Enroller
{
    constructor(
        private readonly authService: IAuthService,
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken
    ){}

}
