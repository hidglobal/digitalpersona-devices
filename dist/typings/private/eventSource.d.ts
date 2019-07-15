import { Event } from '../common';
/**@internal
 *
 */
export declare type Handler<E> = (event: E) => any;
/**@internal
 *
 */
export declare class MultiCastEventSource {
    private handlers;
    protected _on(event: string, handler: Handler<Event>): Handler<Event>;
    protected _off(event?: string, handler?: Handler<Event>): this;
    protected emit(event: Event): void;
    private invoke;
}
