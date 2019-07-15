(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@digitalpersona/core'), require('WebSdk')) :
    typeof define === 'function' && define.amd ? define(['exports', '@digitalpersona/core', 'WebSdk'], factory) :
    (global = global || self, factory((global.dp = global.dp || {}, global.dp.devices = global.dp.devices || {}), global.dp.core));
}(this, function (exports, core) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * A base class for DigitalPersona events.
     */
    var Event = /** @class */ (function () {
        function Event(type) {
            this.type = type;
        }
        return Event;
    }());
    /**
     * An event signaling a problem with a device channel communication.
     */
    var CommunicationFailed = /** @class */ (function (_super) {
        __extends(CommunicationFailed, _super);
        function CommunicationFailed() {
            return _super.call(this, "CommunicationFailed") || this;
        }
        return CommunicationFailed;
    }(Event));

    /** A base class for device events.  */
    var DeviceEvent = /** @class */ (function (_super) {
        __extends(DeviceEvent, _super);
        /** Constructs a new event.
         * @param type - an event type
         * @param deviceId - a device ID.
         */
        function DeviceEvent(type, deviceId) {
            var _this = _super.call(this, type) || this;
            _this.deviceId = deviceId;
            return _this;
        }
        return DeviceEvent;
    }(Event));
    /** An event signaling that a device was connected. */
    var DeviceConnected = /** @class */ (function (_super) {
        __extends(DeviceConnected, _super);
        /** Constructs a new event.
         * @param deviceId - a device ID.
         */
        function DeviceConnected(deviceId) {
            return _super.call(this, "DeviceConnected", deviceId) || this;
        }
        return DeviceConnected;
    }(DeviceEvent));
    /** An event signaling that a device was disconnected. */
    var DeviceDisconnected = /** @class */ (function (_super) {
        __extends(DeviceDisconnected, _super);
        /** Constructs a new event.
         * @param deviceId - a device ID.
         */
        function DeviceDisconnected(deviceId) {
            return _super.call(this, "DeviceDisconnected", deviceId) || this;
        }
        return DeviceDisconnected;
    }(DeviceEvent));

    /** Enumerates supported card types. */
    (function (CardType) {
        /** A smartcard. */
        CardType[CardType["Contact"] = 1] = "Contact";
        /** A contactless card. */
        CardType[CardType["Contactless"] = 2] = "Contactless";
        /** A proximity card. */
        CardType[CardType["Proximity"] = 4] = "Proximity";
    })(exports.CardType || (exports.CardType = {}));
    (function (CardAttributes) {
        /** The card supports PIN code. */
        CardAttributes[CardAttributes["SupportsPIN"] = 1] = "SupportsPIN";
        /** The card supports UID. */
        CardAttributes[CardAttributes["SupportsUID"] = 2] = "SupportsUID";
        /** The card supports PKI. */
        CardAttributes[CardAttributes["IsPKI"] = 65536] = "IsPKI";
        /** The card supports PIV. */
        CardAttributes[CardAttributes["IsPIV"] = 131072] = "IsPIV";
        /** The card is read-only. */
        CardAttributes[CardAttributes["IsReadOnly"] = 2147483648] = "IsReadOnly";
    })(exports.CardAttributes || (exports.CardAttributes = {}));

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

    /**@internal
     *
     */
    var MultiCastEventSource = /** @class */ (function () {
        function MultiCastEventSource() {
            this.handlers = {};
        }
        MultiCastEventSource.prototype._on = function (event, handler) {
            this.handlers[event] = this.handlers[event] || [];
            this.handlers[event].push(handler);
            return handler;
        };
        MultiCastEventSource.prototype._off = function (event, handler) {
            if (event) {
                var hh = this.handlers[event];
                if (hh) {
                    if (handler)
                        this.handlers[event] = hh.filter(function (h) { return h !== handler; });
                    else
                        delete this.handlers[event];
                }
            }
            else
                this.handlers = {};
            return this;
        };
        MultiCastEventSource.prototype.emit = function (event) {
            var _this = this;
            if (!event)
                return;
            var eventName = event.type;
            var unicast = this["on" + eventName];
            if (unicast)
                this.invoke(unicast, event);
            var multicast = this.handlers[eventName];
            if (multicast)
                multicast.forEach(function (h) { return _this.invoke(h, event); });
        };
        MultiCastEventSource.prototype.invoke = function (handler, event) {
            try {
                handler(event);
            }
            catch (e) {
                console.error(e);
            }
        };
        return MultiCastEventSource;
    }());

    /**@internal
     *
     */
    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["Response"] = 0] = "Response";
        MessageType[MessageType["Notification"] = 1] = "Notification";
    })(MessageType || (MessageType = {}));

    /**@internal
     *
     */
    var Channel = /** @class */ (function () {
        function Channel(channelName, options) {
            this.pending = [];
            this.webChannel = new WebSdk.WebChannelClient(channelName, options);
            this.webChannel.onConnectionSucceed = this.onConnectionSucceed.bind(this);
            this.webChannel.onConnectionFailed = this.onConnectionFailed.bind(this);
            this.webChannel.onDataReceivedTxt = this.onDataReceivedTxt.bind(this);
        }
        Channel.prototype.send = function (request, timeout) {
            var deferred = new Promise(function (resolve, reject) {
                request.resolve = resolve;
                request.reject = reject;
                if (timeout) {
                    request.timer = window.setTimeout(function () {
                        if (request.timer)
                            try {
                                request.reject(new Error("Timeout"));
                            }
                            catch (e) { }
                    }, timeout);
                }
            });
            this.pending.push(request);
            if (this.webChannel.isConnected())
                this.processRequestQueue();
            else
                this.webChannel.connect();
            return deferred;
        };
        Channel.prototype.onConnectionSucceed = function () {
            this.processRequestQueue();
        };
        Channel.prototype.onConnectionFailed = function () {
            this.pending.forEach(function (r) { return r.reject(new Error("Communication failure.")); });
            this.pending = [];
            if (this.onCommunicationError)
                try {
                    this.onCommunicationError();
                }
                catch (e) { }
        };
        Channel.prototype.onDataReceivedTxt = function (data) {
            var message = JSON.parse(core.Utf8.fromBase64Url(data));
            if (message.Type === MessageType.Response) {
                var response = JSON.parse(core.Utf8.fromBase64Url(message.Data || ""));
                var request = this.findRequest(response);
                if (request !== null) {
                    if (request.timer) {
                        window.clearTimeout(request.timer);
                        delete request.timer;
                    }
                    var hr = (response.Result >>> 0);
                    if (hr > 0x7FFFFFFF)
                        request.reject(new Error("0x" + hr.toString(16)));
                    else
                        request.resolve(response);
                }
                else
                    console.log("Orphaned response: " + message.Type);
            }
            else if (message.Type === MessageType.Notification) {
                var notification = JSON.parse(core.Utf8.fromBase64Url(message.Data || ""));
                if (this.onNotification)
                    try {
                        this.onNotification(notification);
                    }
                    catch (e) { }
            }
            else
                console.log("Unknown message type: " + message.Type);
        };
        Channel.prototype.processRequestQueue = function () {
            var _this = this;
            this.pending.forEach(function (req, i, items) {
                if (!req.sent) {
                    _this.webChannel.sendDataTxt(core.Base64Url.fromJSON(req.command));
                    items[i].sent = true;
                }
            });
        };
        Channel.prototype.findRequest = function (response) {
            for (var i = 0; i < this.pending.length; i++) {
                var request = this.pending[i];
                if (request.sent && (request.command.Method === response.Method)) {
                    this.pending.splice(i, 1);
                    return request;
                }
            }
            return null;
        };
        return Channel;
    }());

    /**@internal
     *
     */
    var Command = /** @class */ (function () {
        function Command(method, parameters) {
            this.Method = method;
            this.Parameters = parameters;
        }
        return Command;
    }());
    /**@internal
     *
     */
    var Request = /** @class */ (function () {
        function Request(command) {
            this.command = command;
            this.sent = false;
        }
        return Request;
    }());

    /**@internal
     *
     */
    var Method;
    (function (Method) {
        Method[Method["EnumerateReaders"] = 1] = "EnumerateReaders";
        Method[Method["EnumerateCards"] = 2] = "EnumerateCards";
        Method[Method["GetCardInfo"] = 3] = "GetCardInfo";
        Method[Method["GetCardUID"] = 4] = "GetCardUID";
        Method[Method["GetDPCardAuthData"] = 5] = "GetDPCardAuthData";
        Method[Method["GetDPCardEnrollData"] = 6] = "GetDPCardEnrollData";
        Method[Method["Subscribe"] = 100] = "Subscribe";
        Method[Method["Unsubscribe"] = 101] = "Unsubscribe";
    })(Method || (Method = {}));
    /**@internal
     *
     */
    var NotificationType;
    (function (NotificationType) {
        NotificationType[NotificationType["ReaderConnected"] = 1] = "ReaderConnected";
        NotificationType[NotificationType["ReaderDisconnected"] = 2] = "ReaderDisconnected";
        NotificationType[NotificationType["CardInserted"] = 3] = "CardInserted";
        NotificationType[NotificationType["CardRemoved"] = 4] = "CardRemoved";
    })(NotificationType || (NotificationType = {}));

    /**
     * A card reader API class.
     * An instance of this class allows to subscribe to card reader events and read card data.
     * The card reader API uses DigitalPersona WebSDK to communicate with card reader drivers and hardware.
     */
    var CardsReader = /** @class */ (function (_super) {
        __extends(CardsReader, _super);
        /**
         * Constructs a new card reader API object.
         * @param options - options for the `WebSdk` channel.
         */
        function CardsReader(options) {
            var _this = _super.call(this) || this;
            _this.channel = new Channel("smartcards", options);
            _this.channel.onCommunicationError = _this.onConnectionFailed.bind(_this);
            _this.channel.onNotification = _this.processNotification.bind(_this);
            return _this;
        }
        /**
         * Adds an event handler for the event.
         * This is a multicast subscription, i.e. many handlers can be registered at once.
         *
         * @param event - a name of the event to subscribe, e.g. "CardInserted"
         * @param handler - an event handler.
         * @returns an event handler reference.
         * Store the reference and pass it to the {@link CardsReader.off} to unsubscribe from the event.
         *
         * @example
         * ```
         * class CardComponent
         * {
         *     private reader: CardsReader;
         *
         *     private onCardInserted = (event: CardInserted) => { ... }
         *     private onCardRemoved = (event: CardRemoved) => { ... }
         *     ...
         *
         *     public async $onInit() {
         *         this.reader = new CardsReader();
         *         this.reader.on("CardInserted", this.onCardInserted);
         *         this.reader.on("CardRemoved", this.onCardRemoved);
         *         ...
         *         await this.cardReader.subscribe()
         *     }
         *     public async $onDestroy() {
         *         await this.cardReader.unsubscribe();
         *         this.reader.off("CardInserted", this.onCardInserted);
         *         this.reader.off("CardRemoved", this.onCardRemoved);
         *         ...
         *         // alternatively, call this.reader.off() to unsubscribe from all events at once.
         *         delete this.reader;
         *     }
         * }
         * ```
         */
        CardsReader.prototype.on = function (event, handler) { return this._on(event, handler); };
        /** Deletes an event handler for the event.
         * @param event - a name of the event to subscribe.
         * @param handler - an event handler added with the {@link CardsReader.on} method.
         * @example See example in {@link CardsReader.on}
         */
        CardsReader.prototype.off = function (event, handler) { return this._off(event, handler); };
        /** Lists all connected card readers.
         * @returns a promise to return a list of card reader names.
         */
        CardsReader.prototype.enumerateReaders = function () {
            return this.channel.send(new Request(new Command(Method.EnumerateReaders)))
                .then(function (response) {
                var list = JSON.parse(core.Utf8.fromBase64Url(response.Data || "{}"));
                return JSON.parse(list.Readers || "[]");
            });
        };
        /** Lists all inserted cards.
         * @returns a promise to return a list of card information for connected cards.
         */
        CardsReader.prototype.enumerateCards = function () {
            return this.channel.send(new Request(new Command(Method.EnumerateCards)))
                .then(function (response) {
                var list = JSON.parse(core.Utf8.fromBase64Url(response.Data || "{}"));
                var cards = JSON.parse(list.Cards || "[]");
                return cards.map(function (s) { return JSON.parse(core.Utf16.fromBase64Url(s)); });
            });
        };
        /** Reads card data from a specific card.
         * @param reader - a name of a card reader where the card was presented.
         * @returns a promise to return a card information.
         * The promise can be fulfilled but return `null` if the card has no information.
         * The promise will be rejected if a card is not found or in case of a reading error.
         */
        CardsReader.prototype.getCardInfo = function (reader) {
            return this.channel.send(new Request(new Command(Method.GetCardInfo, core.Base64Url.fromJSON({ Reader: reader }))))
                .then(function (response) {
                var cardInfo = JSON.parse(core.Utf8.fromBase64Url(response.Data || "null"));
                return cardInfo;
            });
        };
        /** Reads a card unique identifier.
         * @param reader - a name of a card reader where the card was presented.
         * @returns a promise to return a card identifier.
         */
        CardsReader.prototype.getCardUid = function (reader) {
            return this.channel.send(new Request(new Command(Method.GetCardUID, core.Base64Url.fromJSON({ Reader: reader }))))
                .then(function (response) {
                var data = core.Base64.fromBase64Url(response.Data || "");
                return data;
            });
        };
        /** Reads card authentication data.
         * @param reader - a name of a card reader where the card was presented.
         * @param pin - an PIN code (for cards requiring a PIN).
         * @returns a promise to return card authentication data.
         * The card data is an opaque encoded string which should be sent to the server as is.
         */
        CardsReader.prototype.getCardAuthData = function (reader, pin) {
            return this.channel.send(new Request(new Command(Method.GetDPCardAuthData, core.Base64Url.fromJSON({ Reader: reader, PIN: pin || "" }))))
                .then(function (response) {
                var data = JSON.parse(core.Utf8.fromBase64Url(response.Data || ""));
                return data;
            });
        };
        /** Reads card enrollment data.
         * @param reader - a name of a card reader where the card was presented.
         * @param pin - an PIN code (for cards requiring a PIN).
         * @returns a promise to return a card enrollment data.
         * The card data is an opaque encoded string which should be sent to the server as is.
         */
        CardsReader.prototype.getCardEnrollData = function (reader, pin) {
            return this.channel.send(new Request(new Command(Method.GetDPCardEnrollData, core.Base64Url.fromJSON({ Reader: reader, PIN: pin || "" }))))
                .then(function (response) {
                var data = JSON.parse(core.Utf8.fromBase64Url(response.Data || ""));
                return data;
            });
        };
        /** Starts listening for card reader events.
         * @param reader - an optional name of a card reader to listen.
         * If no name is provided, the API will start listening all card readers.
         */
        CardsReader.prototype.subscribe = function (reader) {
            return this.channel.send(new Request(new Command(Method.Subscribe, reader ? core.Base64Url.fromJSON({ Reader: reader }) : "")))
                .then();
        };
        /** Stop listening for card reader events.
         * @param reader - an optional name of a card reader to stop listening.
         * If no name is provided, the API will stop listening all card readers.
         */
        CardsReader.prototype.unsubscribe = function (reader) {
            return this.channel.send(new Request(new Command(Method.Unsubscribe, reader ? core.Base64Url.fromJSON({ Reader: reader }) : "")))
                .then();
        };
        /** Converts WebSdk connectivity error to a card API event. */
        CardsReader.prototype.onConnectionFailed = function () {
            this.emit(new CommunicationFailed());
        };
        /** Converts WebSdk notification to card API events. */
        CardsReader.prototype.processNotification = function (notification) {
            switch (notification.Event) {
                case NotificationType.ReaderConnected:
                    return this.emit(new DeviceConnected(notification.Reader));
                case NotificationType.ReaderDisconnected:
                    return this.emit(new DeviceDisconnected(notification.Reader));
                case NotificationType.CardInserted:
                    return this.emit(new CardInserted(notification.Reader, notification.Card));
                case NotificationType.CardRemoved:
                    return this.emit(new CardRemoved(notification.Reader, notification.Card));
                default:
                    console.log("Unknown notification: " + notification.Event);
            }
        };
        return CardsReader;
    }(MultiCastEventSource
    //    implements CommunicationEventSource, DeviceEventSource, CardsEventSource
    ));

    /**
     * Fingerprint device types.
     */
    (function (DeviceUidType) {
        /** The fingerprint device is embedded and cannot be removed. */
        DeviceUidType[DeviceUidType["Persistent"] = 0] = "Persistent";
        /** The fingerprint device can be removed. */
        DeviceUidType[DeviceUidType["Volatile"] = 1] = "Volatile";
    })(exports.DeviceUidType || (exports.DeviceUidType = {}));
    (function (DeviceModality) {
        /** The fingerprint modality is not known. */
        DeviceModality[DeviceModality["Unknown"] = 0] = "Unknown";
        /** Users must swipe a single finger.  */
        DeviceModality[DeviceModality["Swipe"] = 1] = "Swipe";
        /** Users must place a single finger over a scaning area. */
        DeviceModality[DeviceModality["Area"] = 2] = "Area";
        /** Users must place multiple fingers over a scaning area. */
        DeviceModality[DeviceModality["AreaMultifinger"] = 3] = "AreaMultifinger";
    })(exports.DeviceModality || (exports.DeviceModality = {}));
    (function (DeviceTechnology) {
        /** The method of scanning is unknown. */
        DeviceTechnology[DeviceTechnology["Unknown"] = 0] = "Unknown";
        /** The reader uses an optical image of a finger skin. */
        DeviceTechnology[DeviceTechnology["Optical"] = 1] = "Optical";
        /** The reader uses changes of electrical capacitance of a finger skin. */
        DeviceTechnology[DeviceTechnology["Capacitive"] = 2] = "Capacitive";
        /** The reader uses a thermal image of a finger.  */
        DeviceTechnology[DeviceTechnology["Thermal"] = 3] = "Thermal";
        /** The reader uses changes of a pressure under the finger. */
        DeviceTechnology[DeviceTechnology["Pressure"] = 4] = "Pressure";
    })(exports.DeviceTechnology || (exports.DeviceTechnology = {}));

    /**
     * A fingerprint sample format.
     */
    (function (SampleFormat) {
        /** A raw fingerprint image (bitmap). */
        SampleFormat[SampleFormat["Raw"] = 1] = "Raw";
        /** A fingerprint image encoded into an intermediate format. */
        SampleFormat[SampleFormat["Intermediate"] = 2] = "Intermediate";
        /** A compressed fingerprint image (e.q. JPEG2000, WSQ). */
        SampleFormat[SampleFormat["Compressed"] = 3] = "Compressed";
        /** A Portable Network Graphics (PNG) format. */
        SampleFormat[SampleFormat["PngImage"] = 5] = "PngImage";
    })(exports.SampleFormat || (exports.SampleFormat = {}));
    (function (QualityCode) {
        QualityCode[QualityCode["Good"] = 0] = "Good";
        QualityCode[QualityCode["NoImage"] = 1] = "NoImage";
        QualityCode[QualityCode["TooLight"] = 2] = "TooLight";
        QualityCode[QualityCode["TooDark"] = 3] = "TooDark";
        QualityCode[QualityCode["TooNoisy"] = 4] = "TooNoisy";
        QualityCode[QualityCode["LowContrast"] = 5] = "LowContrast";
        QualityCode[QualityCode["NotEnoughFeatures"] = 6] = "NotEnoughFeatures";
        QualityCode[QualityCode["NotCentered"] = 7] = "NotCentered";
        QualityCode[QualityCode["NotAFinger"] = 8] = "NotAFinger";
        QualityCode[QualityCode["TooHigh"] = 9] = "TooHigh";
        QualityCode[QualityCode["TooLow"] = 10] = "TooLow";
        QualityCode[QualityCode["TooLeft"] = 11] = "TooLeft";
        QualityCode[QualityCode["TooRight"] = 12] = "TooRight";
        QualityCode[QualityCode["TooStrange"] = 13] = "TooStrange";
        QualityCode[QualityCode["TooFast"] = 14] = "TooFast";
        QualityCode[QualityCode["TooSkewed"] = 15] = "TooSkewed";
        QualityCode[QualityCode["TooShort"] = 16] = "TooShort";
        QualityCode[QualityCode["TooSlow"] = 17] = "TooSlow";
        QualityCode[QualityCode["ReverseMotion"] = 18] = "ReverseMotion";
        QualityCode[QualityCode["PressureTooHard"] = 19] = "PressureTooHard";
        QualityCode[QualityCode["PressureTooLight"] = 20] = "PressureTooLight";
        QualityCode[QualityCode["WetFinger"] = 21] = "WetFinger";
        QualityCode[QualityCode["FakeFinger"] = 22] = "FakeFinger";
        QualityCode[QualityCode["TooSmall"] = 23] = "TooSmall";
        QualityCode[QualityCode["RotatedTooMuch"] = 24] = "RotatedTooMuch";
    })(exports.QualityCode || (exports.QualityCode = {}));

    /** An event signaling that a new fingerprint sample (or samples) was acquired during a scan. */
    var SamplesAcquired = /** @class */ (function (_super) {
        __extends(SamplesAcquired, _super);
        /** Constructs a new event object.
         * @param deviceUid - a fingerprint reader ID.
         * @param sampleFormat - a fingerprint sample format.
         * @param sampleData - raw sample data received with WebSdk notifiation.
         */
        function SamplesAcquired(deviceUid, sampleFormat, sampleData) {
            var _this = _super.call(this, "SamplesAcquired", deviceUid) || this;
            _this.sampleFormat = sampleFormat;
            _this.samples = JSON.parse(sampleData);
            return _this;
        }
        return SamplesAcquired;
    }(DeviceEvent));
    /** An event reporting a quality of a fingerprint scan. */
    var QualityReported = /** @class */ (function (_super) {
        __extends(QualityReported, _super);
        /** Constructs a new event object.
         * @param deviceUid - a fingerprint reader ID.
         * @param quality - a fingerprint scan quality.
         */
        function QualityReported(deviceUid, quality) {
            var _this = _super.call(this, "QualityReported", deviceUid) || this;
            _this.quality = quality;
            return _this;
        }
        return QualityReported;
    }(DeviceEvent));
    /** An event reporting a fingerprint reader error.  */
    var ErrorOccurred = /** @class */ (function (_super) {
        __extends(ErrorOccurred, _super);
        /** Constructs a new event object.
         * @param deviceUid - a fingeprint reader ID.
         * @param error - an error code.
         */
        function ErrorOccurred(deviceUid, error) {
            var _this = _super.call(this, "ErrorOccurred", deviceUid) || this;
            _this.error = error;
            return _this;
        }
        return ErrorOccurred;
    }(DeviceEvent));
    /** An event signaling that a fingerprint reader is ready and waiting to scan a finger. */
    var AcquisitionStarted = /** @class */ (function (_super) {
        __extends(AcquisitionStarted, _super);
        /** Constructs a new event object.
         * @param deviceUid - a fingeprint reader ID.
         */
        function AcquisitionStarted(deviceUid) {
            return _super.call(this, "AcquisitionStarted", deviceUid) || this;
        }
        return AcquisitionStarted;
    }(DeviceEvent));
    /** An event signaling that a fingerprint reader has stopped waiting for a finger scan. */
    var AcquisitionStopped = /** @class */ (function (_super) {
        __extends(AcquisitionStopped, _super);
        /** Constructs a new event object.
         * @param deviceUid - a fingeprint reader ID.
         */
        function AcquisitionStopped(deviceUid) {
            return _super.call(this, "AcquisitionStopped", deviceUid) || this;
        }
        return AcquisitionStopped;
    }(DeviceEvent));

    /**@internal
     *
     */
    var Method$1;
    (function (Method) {
        Method[Method["EnumerateDevices"] = 1] = "EnumerateDevices";
        Method[Method["GetDeviceInfo"] = 2] = "GetDeviceInfo";
        Method[Method["StartAcquisition"] = 3] = "StartAcquisition";
        Method[Method["StopAcquisition"] = 4] = "StopAcquisition";
    })(Method$1 || (Method$1 = {}));
    /**@internal
     *
     */
    var NotificationType$1;
    (function (NotificationType) {
        NotificationType[NotificationType["Completed"] = 0] = "Completed";
        NotificationType[NotificationType["Error"] = 1] = "Error";
        NotificationType[NotificationType["Disconnected"] = 2] = "Disconnected";
        NotificationType[NotificationType["Connected"] = 3] = "Connected";
        NotificationType[NotificationType["Quality"] = 4] = "Quality";
        NotificationType[NotificationType["Stopped"] = 10] = "Stopped";
        NotificationType[NotificationType["Started"] = 11] = "Started";
    })(NotificationType$1 || (NotificationType$1 = {}));

    /**
     * A fingerprint reader API.
     * An instance of this class allows to subscribe to finerprint reader events and read fingerprint data.
     * The fingerprint reader API uses DigitalPersona WebSDK to communicate with fingerprint reader drivers and hardware.
     */
    var FingerprintReader = /** @class */ (function (_super) {
        __extends(FingerprintReader, _super);
        /**
         * Constructs a new fingerprint reader API object.
         * @param options - options for the `WebSdk` channel.
         */
        function FingerprintReader(options) {
            var _this = _super.call(this) || this;
            _this.options = options;
            _this.channel = new Channel("fingerprints", _this.options);
            _this.channel.onCommunicationError = _this.onConnectionFailed.bind(_this);
            _this.channel.onNotification = _this.processNotification.bind(_this);
            return _this;
        }
        /**
         * Adds an event handler for the event.
         * This is a multicast subscription, i.e. many handlers can be registered at once.
         *
         * @param event - a name of the event to subscribe, e.g. "SampleAcquired"
         * @param handler - an event handler.
         * @returns an event handler reference.
         * Store the reference and pass it to the {@link FingerprintReader.off} to unsubscribe from the event.
         *
         * @example
         * ```
         * class FingerprintComponent
         * {
         *     private reader: FingerprintReader;
         *
         *     private onDeviceConnected = (event: DeviceConnected) => { ... };
         *     private onDeviceDisconnected = (event: DeviceDisconnected) => { ... };
         *     private onSamplesAcquired = (event: SampleAquired) => { ... };
         *     ...
         *
         *     public async $onInit() {
         *         this.reader = new FingerprintReader();
         *         this.reader.on("DeviceConnected", onDeviceConnected);
         *         this.reader.on("DeviceDisconnected", onDeviceDisconnected);
         *         this.reader.on("SamplesAcquired", onSamplesAcquired);
         *         ...
         *         await this.fingerprintReader.startAcquisition(SampleFormat.Intermediate);
         *     }
         *     public async $onDestroy() {
         *         await this.fingerprintReader.stopAcquisition();
         *         this.reader.off("DeviceConnected", onDeviceConnected);
         *         this.reader.off("DeviceDisconnected", onDeviceDisconnected);
         *         this.reader.off("SamplesAcquired", onSamplesAcquired);
         *         ...
         *         // alternatively, call this.reader.off() to unsubscribe from all events at once.
         *         delete this.reader;
         *     }
         * }
         * ```
         */
        FingerprintReader.prototype.on = function (event, handler) { return this._on(event, handler); };
        /** Deletes an event handler for the event.
         * @param event - a name of the event to subscribe.
         * @param handler - an event handler added with the {@link FingerprintReader.on} method.
         */
        FingerprintReader.prototype.off = function (event, handler) { return this._off(event, handler); };
        /** Lists all connected fingerprint readers.
         * @returns a promise to return a list of fingerprint reader names.
         */
        FingerprintReader.prototype.enumerateDevices = function () {
            return this.channel.send(new Request(new Command(Method$1.EnumerateDevices)))
                .then(function (response) {
                if (!response)
                    return [];
                var deviceList = JSON.parse(core.Utf8.fromBase64Url(response.Data || "{}"));
                return JSON.parse(deviceList.DeviceIDs || "[]");
            });
        };
        /** Reads a fingerprint reader device information.
         * @param deviceUid - a fingerprint reader ID.
         * @returns a promise to return a device information.
         * The promise can be fulfilled but return `null` if the reader provides no information.
         * The promise will be rejected if a reader is not found or in case of a reading error.
         */
        FingerprintReader.prototype.getDeviceInfo = function (deviceUid) {
            return this.channel.send(new Request(new Command(Method$1.GetDeviceInfo, core.Base64Url.fromJSON({ DeviceID: deviceUid }))))
                .then(function (response) {
                var deviceInfo = JSON.parse(core.Utf8.fromBase64Url(response.Data || "null"));
                return deviceInfo;
            });
        };
        /** Activate a fingerprint acquisition mode.
         * This call will produce a {@link AcquisitionStarted} event if activation was successful.
         * After that the reader will wait for a finger placed on the reader.
         * When a finger is placed, a {@link QualityReported} event will report a scan quality,
         * and a {@link SamplesAcquired} event will return a scanned sample in case of a successful scan.
         */
        FingerprintReader.prototype.startAcquisition = function (sampleFormat, deviceUid) {
            return this.channel.send(new Request(new Command(Method$1.StartAcquisition, core.Base64Url.fromJSON({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
                SampleType: sampleFormat,
            }))))
                .then();
        };
        /** Deactivates a fingerprint acquisition mode.
         * This call will produce a {@link AcquisitionStopped} event if deactivation was successful.
         * After that the reader will stop waiting for a finger.
         */
        FingerprintReader.prototype.stopAcquisition = function (deviceUid) {
            return this.channel.send(new Request(new Command(Method$1.StopAcquisition, core.Base64Url.fromJSON({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
            }))))
                .then();
        };
        /** Converts WebSdk connectivity error to a fingerprint API event. */
        FingerprintReader.prototype.onConnectionFailed = function () {
            this.emit(new CommunicationFailed());
        };
        /** Converts WebSdk notification to fingerprint API events. */
        FingerprintReader.prototype.processNotification = function (notification) {
            switch (notification.Event) {
                case NotificationType$1.Completed:
                    var completed = JSON.parse(core.Utf8.fromBase64Url(notification.Data || ""));
                    return this.emit(new SamplesAcquired(notification.Device, completed.SampleFormat, completed.Samples));
                case NotificationType$1.Error:
                    var error = JSON.parse(core.Utf8.fromBase64Url(notification.Data || ""));
                    return this.emit(new ErrorOccurred(notification.Device, error.uError));
                case NotificationType$1.Disconnected:
                    return this.emit(new DeviceDisconnected(notification.Device));
                case NotificationType$1.Connected:
                    return this.emit(new DeviceConnected(notification.Device));
                case NotificationType$1.Quality:
                    var quality = JSON.parse(core.Utf8.fromBase64Url(notification.Data || ""));
                    return this.emit(new QualityReported(notification.Device, quality.Quality));
                case NotificationType$1.Stopped:
                    return this.emit(new AcquisitionStopped(notification.Device));
                case NotificationType$1.Started:
                    return this.emit(new AcquisitionStarted(notification.Device));
                default:
                    console.log("Unknown notification: " + notification.Event);
            }
        };
        return FingerprintReader;
    }(MultiCastEventSource
    //    implements FingerprintsEventSource, DeviceEventSource, CommunicationEventSource
    ));

    /**@internal
     *
     */
    var Method$2;
    (function (Method) {
        Method[Method["Init"] = 1] = "Init";
        Method[Method["Continue"] = 2] = "Continue";
        Method[Method["Term"] = 3] = "Term";
        Method[Method["Authenticate"] = 4] = "Authenticate";
    })(Method$2 || (Method$2 = {}));
    /**@internal
     *
     */
    var MessageType$1;
    (function (MessageType) {
        MessageType[MessageType["Response"] = 0] = "Response";
        MessageType[MessageType["Notification"] = 1] = "Notification";
    })(MessageType$1 || (MessageType$1 = {}));

    /**
     * Integrated Windows Authentication API.
     * An instance of this class allows internet browsers to authenticate in DigitalPersona servers
     * using Integrated Windows Authentication.
     * The IWA API uses DigitalPersona WebSDK to communicate with Windwows operating system and extract
     * Windows account data for authentication.
     */
    var WindowsAuthClient = /** @class */ (function (_super) {
        __extends(WindowsAuthClient, _super);
        /**
         * Constructs a new IWA API object.
         * @param options - options for the `WebSdk` channel.
         */
        function WindowsAuthClient(options) {
            var _this = _super.call(this) || this;
            _this.channel = new Channel("wia", options);
            _this.channel.onCommunicationError = _this.onConnectionFailed.bind(_this);
            return _this;
        }
        /**
         * Adds an event handler for the event.
         * This is a multicast subscription, i.e. many handlers can be registered at once.
         *
         * @param event - a name of the event to subscribe, e.g. "CommunicationFailed"
         * @param handler - an event handler.
         * @returns an event handler reference.
         * Store the reference and pass it to the {@link WindowsAuthClient.off} to unsubscribe from the event.
         *
         * @example
         * ```
         * class IntegratedWindowsAuthComponent
         * {
         *     private client: WindowsAuthClient;
         *
         *     private onCommunicationFailed = (event: CommunicationFailed) => { ... }
         *
         *     public $onInit() {
         *         this.client = new WindowsAuthClient();
         *         this.client.on("CommunicationFailed", this.onCommunicationFailed);
         *     }
         *     public $onDestroy() {
         *         this.client.off("CommunicationFailed", this.onCommunicationFailed);
         *         // alternatively, call this.reader.off() to unsubscribe from all events at once.
         *         delete this.client;
         *     }
         * }
         * ```
         */
        WindowsAuthClient.prototype.on = function (event, handler) { return this._on(event, handler); };
        /** Deletes an event handler for the event.
         * @param event - a name of the event to subscribe.
         * @param handler - an event handler added with the {@link WindowsAuthClient.on} method.
         */
        WindowsAuthClient.prototype.off = function (event, handler) { return this._off(event, handler); };
        /** Used internally. Do not call this method. */
        WindowsAuthClient.prototype.init = function () {
            return this.channel.send(new Request(new Command(Method$2.Init)), 3000)
                .then(function (response) {
                var data = JSON.parse(response.Data || "{}");
                return { handle: data.Handle, data: data.Data };
            });
        };
        /** Used internally. Do not call this method. */
        WindowsAuthClient.prototype.continue = function (handle, data) {
            return this.channel.send(new Request(new Command(Method$2.Continue, JSON.stringify({ Handle: handle, Data: data }))))
                .then(function (response) {
                var d = JSON.parse(response.Data || "{}");
                return d.Data;
            });
        };
        /** Used internally. Do not call this method. */
        WindowsAuthClient.prototype.term = function (handle) {
            return this.channel.send(new Request(new Command(Method$2.Term, JSON.stringify({ Handle: handle }))))
                .then();
        };
        /** Converts WebSdk connectivity error to an IWA API event. */
        WindowsAuthClient.prototype.onConnectionFailed = function () {
            this.emit(new CommunicationFailed());
        };
        return WindowsAuthClient;
    }(MultiCastEventSource));

    exports.AcquisitionStarted = AcquisitionStarted;
    exports.AcquisitionStopped = AcquisitionStopped;
    exports.CardInserted = CardInserted;
    exports.CardRemoved = CardRemoved;
    exports.CardsReader = CardsReader;
    exports.CommunicationFailed = CommunicationFailed;
    exports.DeviceConnected = DeviceConnected;
    exports.DeviceDisconnected = DeviceDisconnected;
    exports.DeviceEvent = DeviceEvent;
    exports.ErrorOccurred = ErrorOccurred;
    exports.Event = Event;
    exports.FingerprintReader = FingerprintReader;
    exports.QualityReported = QualityReported;
    exports.SamplesAcquired = SamplesAcquired;
    exports.WindowsAuthClient = WindowsAuthClient;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
