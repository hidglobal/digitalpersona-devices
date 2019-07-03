import { Handler } from '../private';
import { CommunicationFailed } from './events';

/** @internal
 * A base interface for a source of communication events.
 */
export interface CommunicationEventSource
{
    onCommunicationFailed: Handler<CommunicationFailed>;
}
