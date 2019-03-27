import { Handler } from 'private';
import { CommunicationFailed } from './events';

export interface CommunicationEventSource
{
    onCommunicationFailed: Handler<CommunicationFailed>;
}
