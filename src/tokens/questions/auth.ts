import { User, Credential, IAuthService, Utf16, JSONWebToken } from '@digitalpersona/access-management';
import { Questions, Answers, Question } from './data';
import { authenticate } from '../workflows';
import { SecurityQuestions } from './credential';

export class SecurityQuestionsAuth
{
    constructor(
        private readonly authService: IAuthService,
    ){
        if (!this.authService)
            throw new Error("authService");
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
        return authenticate(identity, new SecurityQuestions({ answers}), this.authService);
    }

}
