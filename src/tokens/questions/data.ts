export enum QuestionType
{
    Regular,
    Custom
}
export class Question
{
    public readonly version = 1;                   // must be set to 1
    public readonly type: QuestionType;         // regular or custom

    constructor(
        public readonly number: number,             // question index in a regular question list
        public readonly lang_id: number,            // language id
        public readonly sublang_id: number,         // sublaguage id
        public readonly keyboard_layout: number,    // Keyboard layout
        public readonly text?: string,              // text of the question
    ){
        this.type = number < 100 ? QuestionType.Regular : QuestionType.Custom;
    }

    public static fromJson(json: object): Question
    {
        const obj = json as Question;
        return new Question(
            obj.number,
            obj.lang_id, obj.sublang_id,
            obj.keyboard_layout,
            obj.text);
    }
}

export type QuestionsEnrollmentData = Question[];

export class Answer
{
    public readonly version: 1;
    public readonly number: number;
    public readonly text: string;

    constructor(question: Question | number, text: string)
    {
        this.text = text;
        this.number = (question instanceof Question) ? question.number : question;
    }
}

export type Answers = Answer[];
