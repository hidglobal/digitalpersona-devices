/**@internal
 *
 */
var Command = /** @class */ (function () {
    function Command(method, parameters) {
        this.Method = method;
        this.Parameters = parameters;
    }
    return Command;
}());
export { Command };
/**@internal
 *
 */
var Request = /** @class */ (function () {
    function Request(command) {
        this.command = command;
        this.sent = false;
    }
    return Request;
}());
export { Request };
//# sourceMappingURL=command.js.map