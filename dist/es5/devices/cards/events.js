import { __extends } from "tslib";
import { DeviceEvent } from '../events';
/**
 * An event signaling that a card was presented (inserted or touched) to a card reader.
 */
var CardInserted = /** @class */ (function (_super) {
    __extends(CardInserted, _super);
    /** Contructs a new event object.
     * @param reader - a name of a card reader where the card was presented.
     * @param card - a name of a card presented.
     */
    function CardInserted(reader, card) {
        var _this = _super.call(this, "CardInserted", reader) || this;
        _this.cardId = card;
        return _this;
    }
    return CardInserted;
}(DeviceEvent));
export { CardInserted };
/** An event signaling that a card was removed from a card reader. */
var CardRemoved = /** @class */ (function (_super) {
    __extends(CardRemoved, _super);
    /** Contructs a new event object.
     * @param reader - a name of a card reader where the card was presented.
     * @param card - a name of a card presented.
     */
    function CardRemoved(reader, card) {
        var _this = _super.call(this, "CardRemoved", reader) || this;
        _this.cardId = card;
        return _this;
    }
    return CardRemoved;
}(DeviceEvent));
export { CardRemoved };
//# sourceMappingURL=events.js.map