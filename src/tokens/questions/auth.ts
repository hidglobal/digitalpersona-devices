import { User, Credential, IAuthService, Utf16, JSONWebToken } from '@digitalpersona/access-management';
import { Questions, Answers, Question } from './data';
import { Authenticator } from '../workflows';
import { SecurityQuestions } from './credential';

export class SecurityQuestionsAuth extends Authenticator
{
    constructor(authService: IAuthService) {
        super(authService)
    }

    public getQuestions(user: User): Promise<Questions>
    {
        return this.authService
            .GetEnrollmentData(user, Credential.SecurityQuestions)
            .then(data =>
                (JSON.parse(Utf16.fromBase64Url(data)) as object[])
                .map(obj => Question.fromJson(obj)));
    }

    public authenticate(identity: User|JSONWebToken, answers: Answers): Promise<JSONWebToken>
    {
        return super._authenticate(identity, new SecurityQuestions({ answers}));
    }

}
