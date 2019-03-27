export class Command
{
    public readonly Method: number;
    public readonly Parameters?: string;

    constructor(method: number, parameters?: string) {
        this.Method = method;
        this.Parameters = parameters;
    }
}

export class Request
{
    public readonly command: Command;
    public sent: boolean;
    public resolve: Function;
    public reject: Function;
    public timer?: number;

    constructor(command: Command) {
        this.command = command;
        this.sent = false;
    }
}

export interface Response {
    readonly Method: number;
    readonly Result: number;
    readonly Data?: string;
}
