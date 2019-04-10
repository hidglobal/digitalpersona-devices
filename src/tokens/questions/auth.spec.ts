import { Env } from '../../test'
import { SecurityQuestionsAuth } from '.'
import { AuthService, User } from '@digitalpersona/access-management';
import { Answer } from './data';

describe("Questions Token: ", ()=>
{
    let api: SecurityQuestionsAuth;

    const user: User = new User("alpha\\administrator");

    beforeEach(()=>{
        api = new SecurityQuestionsAuth(
            new AuthService(Env.AuthServerEndpoint)
        );
    })

    it("must load enrollment data", async ()=> {
        if (!Env.Integration) return;
        const questions = await api.getQuestions(user);
        expect(questions.length).toBeGreaterThan(0);
    })

    it("must authenticate", async ()=>{
        if (!Env.Integration) return;
        const questions = await api.getQuestions(user);
        const answers = questions.map(q => new Answer(q, "aaaaaa"));
        const token = await api.authenticate(user, answers);
        expect(token).toBeDefined();
    })

    it("must fail", async ()=>{
        if (!Env.Integration) return;
        const questions = await api.getQuestions(user);
        const answers = questions.map(q => new Answer(q, "xxxxxx"));
        await expectAsync(api.authenticate(user, answers)).toBeRejected();
    })

})
