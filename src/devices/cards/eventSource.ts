import { Handler } from '../../private';
import { CardInserted, CardRemoved } from './events';

/** @internal
 * Interface for a card event source.
 */
export interface CardsEventSource
{
    onCardInserted: Handler<CardInserted>;
    onCardRemoved: Handler<CardRemoved>;

    /** {@inheritdoc CardReader.on} */
    on(event: "CardInserted", handler: Handler<CardInserted>): Handler<CardInserted>;

    /** {@inheritdoc CardReader.off} */
    on(event: "CardRemoved", handler: Handler<CardRemoved>): Handler<CardRemoved>;
}
