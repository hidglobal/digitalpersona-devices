import { User, Credential, Ticket, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';
import { Answers, Question } from './data';
import { SecurityQuestions } from './credential';

export class SecurityQuestionsEnroll
{
    constructor(
        private readonly enrollService: IEnrollService,
        private readonly securityOfficer?: JSONWebToken,
    ){
        if (!enrollService)
            throw new Error("enrollService");
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.IsEnrollmentAllowed(
            new Ticket(securityOfficer || this.securityOfficer || ""),
            user,
            Credential.SecurityQuestions
        )
    }

    public enroll(user: JSONWebToken, questions: Question[], answers: Answers, securityOfficer?: JSONWebToken): Promise<void>
    {
        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new SecurityQuestions({ questions, answers }));
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return this.enrollService.DeleteUserCredentials(
            new Ticket(securityOfficer || this.securityOfficer || user),
            new Ticket(user),
            new SecurityQuestions({})
        )
    }

}
