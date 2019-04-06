import { User, Credential, Ticket, IAuthService, Utf16, JSONWebToken, Base64Url, IEnrollService } from '@digitalpersona/access-management';
import { QuestionsEnrollmentData, Answers, Question } from './data';
import { authenticate } from '../../private';

export class RecoveryQuestionsApi
{
    private authService: IAuthService;
    private enrollService?: IEnrollService;

    constructor(authService: IAuthService, enrollService?: IEnrollService) {
        this.authService = authService;
        this.enrollService = enrollService
    }

    public getEnrollmentData(user: User): Promise<QuestionsEnrollmentData>
    {
        return this
            .authService.GetEnrollmentData(user, Credential.SecurityQuestions)
            .then(data =>
                (JSON.parse(Utf16.fromBase64Url(data)) as object[]).map(obj => Question.fromJson(obj)));
    }

    public authenticate(user: User, answers: Answers): Promise<JSONWebToken>
    {
        return authenticate(user,
            new Credential(Credential.SecurityQuestions, Base64Url.fromUtf16(JSON.stringify(answers))),
            this.authService);
    }

    public enroll(securityOfficer: JSONWebToken, user: JSONWebToken, questions: Question[], answers: Answers): Promise<void>
    {
        if (!this.enrollService)
            return Promise.reject(new Error("enrollService"));

        // take only answers with corresponding questions, then sort (NOTE: server requires inverse sort!)
        const As = answers
            .filter(a => questions.findIndex(q => q.number === a.number) >= 0)
            .sort(a => -a.number);

        // take only questions with corresponding answers, then sort (NOTE: server requires inverse sort!)
        const Qs = questions
            .filter(q => answers.findIndex(a => a.number === q.number) >= 0)
            .sort(q => -q.number);

        // now Qs and As correspond to each other and have the same rder. Zip then into a single array of enrollment data.
        const data = Qs.map((q, i, qs) => ({
            question: q,
            answer: As[i]
        }));

        return this.enrollService.EnrollUserCredentials(
            new Ticket(securityOfficer),
            new Ticket(user),
            new Credential(Credential.SecurityQuestions, Base64Url.fromUtf16(JSON.stringify(data))));
    }
}
