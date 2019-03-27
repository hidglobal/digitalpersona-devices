export class Event
{
    type: string;

    constructor(type: string) {
        this.type = type;
    }
}

export class CommunicationFailed extends Event
{
    constructor() {
        super("CommunicationFailed");
    }
}

