import { Env } from './../../test'
import { RecoveryQuestionsApi } from '.'
import { AuthService, User, EnrollService, Credential, Base64Url } from '@digitalpersona/access-management';
import { Answer, Question, QuestionType } from './data';

describe("Questions Token: ", ()=>
{
    let api: RecoveryQuestionsApi;

    const user: User = new User("alpha\\administrator");

    beforeEach(()=>{
        api = new RecoveryQuestionsApi(
            new AuthService(Env.AuthServerEndpoint),
            new EnrollService(Env.EnrollServerEndpoint)
        );
    })

    it("must load enrollment data", async ()=> {
        const questions = await api.getEnrollmentData(user);
        expect(questions.length).toBeGreaterThan(0);
    })

    it("must authenticate", async ()=>{
        if (!Env.Integration) return;
        const questions = await api.getEnrollmentData(user);
        const answers = questions.map(q => new Answer(q, "aaaaaa"));
        const token = await api.authenticate(user, answers);
        expect(token).toBeDefined();
    })

    it("must fail", async ()=>{
        if (!Env.Integration) return;
        const questions = await api.getEnrollmentData(user);
        const answers = questions.map(q => new Answer(q, "xxxxxx"));
        await expectAsync(api.authenticate(user, answers)).toBeRejected();
    })

    fit("must enroll", async () => {
        const questions = [1, 2, 3].map(n => new Question(n, 9, 1, 1033));
        const answers = [2,3,1].map(n => new Answer(n, "aaaaaa"));
        const auth = new AuthService(Env.AuthServerEndpoint);

        const officer = await auth.AuthenticateUser(user, new Credential(Credential.Password, Base64Url.fromUtf16("aaaAAA123")))
        await expectAsync(api.enroll(officer.jwt, officer.jwt, questions, answers)).toBeResolved();
    })
})
