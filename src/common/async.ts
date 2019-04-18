/**@internal
 *
 */
export class Deferred<T> {
    public promise: Promise<T>;
    public resolve: Function;
    public reject: Function;

    constructor() {
        const _this = this;
        this.promise = new Promise<T>(function(resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject
        });
    }
}
