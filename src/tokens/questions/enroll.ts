import { User, Credential, Ticket, IEnrollService, JSONWebToken } from '@digitalpersona/access-management';
import { Answers, Question } from './data';
import { SecurityQuestions } from './credential';
import { Enroller } from '../workflows/enrollment';

export class SecurityQuestionsEnroll extends Enroller
{
    constructor(
        enrollService: IEnrollService,
        securityOfficer?: JSONWebToken,
    ){
        super(enrollService, securityOfficer);
    }

    public canEnroll(user: User, securityOfficer?: JSONWebToken): Promise<void> {
        return super._canEnroll(user, Credential.SecurityQuestions, securityOfficer);
    }

    public enroll(
        user: JSONWebToken,
        questions: Question[],
        answers: Answers,
        securityOfficer?: JSONWebToken): Promise<void>
    {
        return super._enroll(user, new SecurityQuestions({ questions, answers }), securityOfficer);
    }

    public unenroll(user: JSONWebToken, securityOfficer?: JSONWebToken): Promise<void> {
        return super._unenroll(user, new SecurityQuestions({}), securityOfficer);
    }

}
