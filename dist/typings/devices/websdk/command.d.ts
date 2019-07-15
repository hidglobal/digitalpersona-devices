/**@internal
 *
 */
export declare class Command {
    readonly Method: number;
    readonly Parameters?: string;
    constructor(method: number, parameters?: string);
}
/**@internal
 *
 */
export declare class Request {
    readonly command: Command;
    sent: boolean;
    resolve: Function;
    reject: Function;
    timer?: number;
    constructor(command: Command);
}
/**@internal
 *
 */
export interface Response {
    readonly Method: number;
    readonly Result: number;
    readonly Data?: string;
}
