import { DeviceEvent } from '../events';

export class CardInserted extends DeviceEvent
{
    public cardId: string;

    constructor(reader: string, card: string) {
        super("CardInserted", reader);
        this.cardId = card;
    }
}

export class CardRemoved extends DeviceEvent
{
    public cardId: string;

    constructor(reader: string, card: string) {
        super("CardRemoved", reader);
        this.cardId = card;
    }
}
