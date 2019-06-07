import { Handler } from '../../private';
import { CardInserted, CardRemoved } from './events';

export interface CardsEventSource
{
    onCardInserted: Handler<CardInserted>;
    onCardRemoved: Handler<CardRemoved>;

    on(event: "CardInserted", handler: Handler<CardInserted>): Handler<CardInserted>;
    on(event: "CardRemoved", handler: Handler<CardRemoved>): Handler<CardRemoved>;
}
