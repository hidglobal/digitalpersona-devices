/**@internal
 *
 */
export class Command {
    constructor(method, parameters) {
        this.Method = method;
        this.Parameters = parameters;
    }
}
/**@internal
 *
 */
export class Request {
    constructor(command) {
        this.command = command;
        this.sent = false;
    }
}
//# sourceMappingURL=command.js.map