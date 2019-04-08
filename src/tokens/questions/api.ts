import { User, Credential, Ticket, IAuthService, IEnrollService, Utf16, JSONWebToken } from '@digitalpersona/access-management';
import { Questions, Answers, Question } from './data';
import { authenticate } from '../workflows';
import { SecurityQuestions } from './credential';

export class SecurityQuestionsApi
{
    constructor(
        private readonly authService: IAuthService,
        private readonly enrollService?: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){}

    public getEnrollmentData(user: User): Promise<Questions>
    {
        return this
            .authService.GetEnrollmentData(user, Credential.SecurityQuestions)
            .then(data =>
                (JSON.parse(Utf16.fromBase64Url(data)) as object[]).map(obj => Question.fromJson(obj)));
    }

    public authenticate(user: User, answers: Answers): Promise<JSONWebToken>
    {
        return authenticate(user,
            new SecurityQuestions({ answers}),
            this.authService);
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.SecurityQuestions
        )
    }

    public enroll(user: JSONWebToken, questions: Question[], answers: Answers, securityOfficer?: JSONWebToken): Promise<void>
    {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));

        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new SecurityQuestions({ questions, answers }));
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));
        return this.enrollService
            .DeleteUserCredentials(
                new Ticket(securityOfficer || this.securityOfficer || user),
                new Ticket(user),
                new SecurityQuestions({})
            )
    }

}
