import { Credential, Base64Url } from '@digitalpersona/access-management';
import { Questions, Answers } from "./data";

export class SecurityQuestions extends Credential
{
    constructor(data: {questions?: Questions, answers?: Answers}) {
        super(Credential.SecurityQuestions, Base64Url.fromUtf16(JSON.stringify(
            data.answers && data.questions
                ? SecurityQuestions.canonicalize({ questions: data.questions, answers: data.answers })
                : data.answers || data.questions || null
        )));
    }

    private static canonicalize(data: { questions: Questions, answers: Answers }) {
        // take only answers with corresponding questions, then sort (NOTE: server requires inverse sort!)
        const As = data.answers
            .filter(a => data.questions.findIndex(q => q.number === a.number) >= 0)
            .sort(a => -a.number);

        // take only questions with corresponding answers, then sort (NOTE: server requires inverse sort!)
        const Qs = data.questions
            .filter(q => data.answers.findIndex(a => a.number === q.number) >= 0)
            .sort(q => -q.number);

        // now Qs and As correspond to each other and have the same rder. Zip then into a single array of enrollment data.
        return Qs.map((q, i, qs) => ({
            question: q,
            answer: As[i]
        }));
    }
}
