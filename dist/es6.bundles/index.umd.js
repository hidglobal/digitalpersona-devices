(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@digitalpersona/core'), require('WebSdk')) :
    typeof define === 'function' && define.amd ? define(['exports', '@digitalpersona/core', 'WebSdk'], factory) :
    (global = global || self, factory((global.dp = global.dp || {}, global.dp.devices = global.dp.devices || {}), global.dp.core));
}(this, function (exports, core) { 'use strict';

    /**
     * A base class for DigitalPersona events.
     */
    class Event {
        constructor(type) {
            this.type = type;
        }
    }
    /**
     * An event signaling a problem with a device channel communication.
     */
    class CommunicationFailed extends Event {
        constructor() {
            super("CommunicationFailed");
        }
    }

    /** A base class for device events.  */
    class DeviceEvent extends Event {
        /** Constructs a new event.
         * @param type - an event type
         * @param deviceId - a device ID.
         */
        constructor(type, deviceId) {
            super(type);
            this.deviceId = deviceId;
        }
    }
    /** An event signaling that a device was connected. */
    class DeviceConnected extends DeviceEvent {
        /** Constructs a new event.
         * @param deviceId - a device ID.
         */
        constructor(deviceId) {
            super("DeviceConnected", deviceId);
        }
    }
    /** An event signaling that a device was disconnected. */
    class DeviceDisconnected extends DeviceEvent {
        /** Constructs a new event.
         * @param deviceId - a device ID.
         */
        constructor(deviceId) {
            super("DeviceDisconnected", deviceId);
        }
    }

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
    class CardInserted extends DeviceEvent {
        /** Contructs a new event object.
         * @param reader - a name of a card reader where the card was presented.
         * @param card - a name of a card presented.
         */
        constructor(reader, card) {
            super("CardInserted", reader);
            this.cardId = card;
        }
    }
    /** An event signaling that a card was removed from a card reader. */
    class CardRemoved extends DeviceEvent {
        /** Contructs a new event object.
         * @param reader - a name of a card reader where the card was presented.
         * @param card - a name of a card presented.
         */
        constructor(reader, card) {
            super("CardRemoved", reader);
            this.cardId = card;
        }
    }

    /**@internal
     *
     */
    class MultiCastEventSource {
        constructor() {
            this.handlers = {};
        }
        _on(event, handler) {
            this.handlers[event] = this.handlers[event] || [];
            this.handlers[event].push(handler);
            return handler;
        }
        _off(event, handler) {
            if (event) {
                const hh = this.handlers[event];
                if (hh) {
                    if (handler)
                        this.handlers[event] = hh.filter(h => h !== handler);
                    else
                        delete this.handlers[event];
                }
            }
            else
                this.handlers = {};
            return this;
        }
        emit(event) {
            if (!event)
                return;
            const eventName = event.type;
            const unicast = this["on" + eventName];
            if (unicast)
                this.invoke(unicast, event);
            const multicast = this.handlers[eventName];
            if (multicast)
                multicast.forEach(h => this.invoke(h, event));
        }
        invoke(handler, event) {
            try {
                handler(event);
            }
            catch (e) {
                console.error(e);
            }
        }
    }

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
    class Channel {
        constructor(channelName, options) {
            this.pending = [];
            this.webChannel = new WebSdk.WebChannelClient(channelName, options);
            this.webChannel.onConnectionSucceed = this.onConnectionSucceed.bind(this);
            this.webChannel.onConnectionFailed = this.onConnectionFailed.bind(this);
            this.webChannel.onDataReceivedTxt = this.onDataReceivedTxt.bind(this);
        }
        send(request, timeout) {
            const deferred = new Promise((resolve, reject) => {
                request.resolve = resolve;
                request.reject = reject;
                if (timeout) {
                    request.timer = window.setTimeout(() => {
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
        }
        onConnectionSucceed() {
            this.processRequestQueue();
        }
        onConnectionFailed() {
            this.pending.forEach(r => r.reject(new Error("Communication failure.")));
            this.pending = [];
            if (this.onCommunicationError)
                try {
                    this.onCommunicationError();
                }
                catch (e) { }
        }
        onDataReceivedTxt(data) {
            const message = JSON.parse(core.Utf8.fromBase64Url(data));
            if (message.Type === MessageType.Response) {
                const response = JSON.parse(core.Utf8.fromBase64Url(message.Data || ""));
                const request = this.findRequest(response);
                if (request !== null) {
                    if (request.timer) {
                        window.clearTimeout(request.timer);
                        delete request.timer;
                    }
                    const hr = (response.Result >>> 0);
                    if (hr > 0x7FFFFFFF)
                        request.reject(new Error(`0x${hr.toString(16)}`));
                    else
                        request.resolve(response);
                }
                else
                    console.log(`Orphaned response: ${message.Type}`);
            }
            else if (message.Type === MessageType.Notification) {
                const notification = JSON.parse(core.Utf8.fromBase64Url(message.Data || ""));
                if (this.onNotification)
                    try {
                        this.onNotification(notification);
                    }
                    catch (e) { }
            }
            else
                console.log(`Unknown message type: ${message.Type}`);
        }
        processRequestQueue() {
            this.pending.forEach((req, i, items) => {
                if (!req.sent) {
                    this.webChannel.sendDataTxt(core.Base64Url.fromJSON(req.command));
                    items[i].sent = true;
                }
            });
        }
        findRequest(response) {
            for (let i = 0; i < this.pending.length; i++) {
                const request = this.pending[i];
                if (request.sent && (request.command.Method === response.Method)) {
                    this.pending.splice(i, 1);
                    return request;
                }
            }
            return null;
        }
    }

    /**@internal
     *
     */
    class Command {
        constructor(method, parameters) {
            this.Method = method;
            this.Parameters = parameters;
        }
    }
    /**@internal
     *
     */
    class Request {
        constructor(command) {
            this.command = command;
            this.sent = false;
        }
    }

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
    class CardsReader extends MultiCastEventSource {
        /**
         * Constructs a new card reader API object.
         * @param options - options for the `WebSdk` channel.
         */
        constructor(options) {
            super();
            this.channel = new Channel("smartcards", options);
            this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
            this.channel.onNotification = this.processNotification.bind(this);
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
        on(event, handler) { return this._on(event, handler); }
        /** Deletes an event handler for the event.
         * @param event - a name of the event to subscribe.
         * @param handler - an event handler added with the {@link CardsReader.on} method.
         * @example See example in {@link CardsReader.on}
         */
        off(event, handler) { return this._off(event, handler); }
        /** Lists all connected card readers.
         * @returns a promise to return a list of card reader names.
         */
        enumerateReaders() {
            return this.channel.send(new Request(new Command(Method.EnumerateReaders)))
                .then(response => {
                const list = JSON.parse(core.Utf8.fromBase64Url(response.Data || "{}"));
                return JSON.parse(list.Readers || "[]");
            });
        }
        /** Lists all inserted cards.
         * @returns a promise to return a list of card information for connected cards.
         */
        enumerateCards() {
            return this.channel.send(new Request(new Command(Method.EnumerateCards)))
                .then(response => {
                const list = JSON.parse(core.Utf8.fromBase64Url(response.Data || "{}"));
                const cards = JSON.parse(list.Cards || "[]");
                return cards.map(s => JSON.parse(core.Utf16.fromBase64Url(s)));
            });
        }
        /** Reads card data from a specific card.
         * @param reader - a name of a card reader where the card was presented.
         * @returns a promise to return a card information.
         * The promise can be fulfilled but return `null` if the card has no information.
         * The promise will be rejected if a card is not found or in case of a reading error.
         */
        getCardInfo(reader) {
            return this.channel.send(new Request(new Command(Method.GetCardInfo, core.Base64Url.fromJSON({ Reader: reader }))))
                .then(response => {
                const cardInfo = JSON.parse(core.Utf8.fromBase64Url(response.Data || "null"));
                return cardInfo;
            });
        }
        /** Reads a card unique identifier.
         * @param reader - a name of a card reader where the card was presented.
         * @returns a promise to return a card identifier.
         */
        getCardUid(reader) {
            return this.channel.send(new Request(new Command(Method.GetCardUID, core.Base64Url.fromJSON({ Reader: reader }))))
                .then(response => {
                const data = core.Base64.fromBase64Url(response.Data || "");
                return data;
            });
        }
        /** Reads card authentication data.
         * @param reader - a name of a card reader where the card was presented.
         * @param pin - an PIN code (for cards requiring a PIN).
         * @returns a promise to return card authentication data.
         * The card data is an opaque encoded string which should be sent to the server as is.
         */
        getCardAuthData(reader, pin) {
            return this.channel.send(new Request(new Command(Method.GetDPCardAuthData, core.Base64Url.fromJSON({ Reader: reader, PIN: pin || "" }))))
                .then(response => {
                const data = JSON.parse(core.Utf8.fromBase64Url(response.Data || ""));
                return data;
            });
        }
        /** Reads card enrollment data.
         * @param reader - a name of a card reader where the card was presented.
         * @param pin - an PIN code (for cards requiring a PIN).
         * @returns a promise to return a card enrollment data.
         * The card data is an opaque encoded string which should be sent to the server as is.
         */
        getCardEnrollData(reader, pin) {
            return this.channel.send(new Request(new Command(Method.GetDPCardEnrollData, core.Base64Url.fromJSON({ Reader: reader, PIN: pin || "" }))))
                .then(response => {
                const data = JSON.parse(core.Utf8.fromBase64Url(response.Data || ""));
                return data;
            });
        }
        /** Starts listening for card reader events.
         * @param reader - an optional name of a card reader to listen.
         * If no name is provided, the API will start listening all card readers.
         */
        subscribe(reader) {
            return this.channel.send(new Request(new Command(Method.Subscribe, reader ? core.Base64Url.fromJSON({ Reader: reader }) : "")))
                .then();
        }
        /** Stop listening for card reader events.
         * @param reader - an optional name of a card reader to stop listening.
         * If no name is provided, the API will stop listening all card readers.
         */
        unsubscribe(reader) {
            return this.channel.send(new Request(new Command(Method.Unsubscribe, reader ? core.Base64Url.fromJSON({ Reader: reader }) : "")))
                .then();
        }
        /** Converts WebSdk connectivity error to a card API event. */
        onConnectionFailed() {
            this.emit(new CommunicationFailed());
        }
        /** Converts WebSdk notification to card API events. */
        processNotification(notification) {
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
                    console.log(`Unknown notification: ${notification.Event}`);
            }
        }
    }

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
    class SamplesAcquired extends DeviceEvent {
        /** Constructs a new event object.
         * @param deviceUid - a fingerprint reader ID.
         * @param sampleFormat - a fingerprint sample format.
         * @param sampleData - raw sample data received with WebSdk notifiation.
         */
        constructor(deviceUid, sampleFormat, sampleData) {
            super("SamplesAcquired", deviceUid);
            this.sampleFormat = sampleFormat;
            this.samples = JSON.parse(sampleData);
        }
    }
    /** An event reporting a quality of a fingerprint scan. */
    class QualityReported extends DeviceEvent {
        /** Constructs a new event object.
         * @param deviceUid - a fingerprint reader ID.
         * @param quality - a fingerprint scan quality.
         */
        constructor(deviceUid, quality) {
            super("QualityReported", deviceUid);
            this.quality = quality;
        }
    }
    /** An event reporting a fingerprint reader error.  */
    class ErrorOccurred extends DeviceEvent {
        /** Constructs a new event object.
         * @param deviceUid - a fingeprint reader ID.
         * @param error - an error code.
         */
        constructor(deviceUid, error) {
            super("ErrorOccurred", deviceUid);
            this.error = error;
        }
    }
    /** An event signaling that a fingerprint reader is ready and waiting to scan a finger. */
    class AcquisitionStarted extends DeviceEvent {
        /** Constructs a new event object.
         * @param deviceUid - a fingeprint reader ID.
         */
        constructor(deviceUid) {
            super("AcquisitionStarted", deviceUid);
        }
    }
    /** An event signaling that a fingerprint reader has stopped waiting for a finger scan. */
    class AcquisitionStopped extends DeviceEvent {
        /** Constructs a new event object.
         * @param deviceUid - a fingeprint reader ID.
         */
        constructor(deviceUid) {
            super("AcquisitionStopped", deviceUid);
        }
    }

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
    class FingerprintReader extends MultiCastEventSource {
        /**
         * Constructs a new fingerprint reader API object.
         * @param options - options for the `WebSdk` channel.
         */
        constructor(options) {
            super();
            this.options = options;
            this.channel = new Channel("fingerprints", this.options);
            this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
            this.channel.onNotification = this.processNotification.bind(this);
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
        on(event, handler) { return this._on(event, handler); }
        /** Deletes an event handler for the event.
         * @param event - a name of the event to subscribe.
         * @param handler - an event handler added with the {@link FingerprintReader.on} method.
         */
        off(event, handler) { return this._off(event, handler); }
        /** Lists all connected fingerprint readers.
         * @returns a promise to return a list of fingerprint reader names.
         */
        enumerateDevices() {
            return this.channel.send(new Request(new Command(Method$1.EnumerateDevices)))
                .then(response => {
                if (!response)
                    return [];
                const deviceList = JSON.parse(core.Utf8.fromBase64Url(response.Data || "{}"));
                return JSON.parse(deviceList.DeviceIDs || "[]");
            });
        }
        /** Reads a fingerprint reader device information.
         * @param deviceUid - a fingerprint reader ID.
         * @returns a promise to return a device information.
         * The promise can be fulfilled but return `null` if the reader provides no information.
         * The promise will be rejected if a reader is not found or in case of a reading error.
         */
        getDeviceInfo(deviceUid) {
            return this.channel.send(new Request(new Command(Method$1.GetDeviceInfo, core.Base64Url.fromJSON({ DeviceID: deviceUid }))))
                .then(response => {
                const deviceInfo = JSON.parse(core.Utf8.fromBase64Url(response.Data || "null"));
                return deviceInfo;
            });
        }
        /** Activate a fingerprint acquisition mode.
         * This call will produce a {@link AcquisitionStarted} event if activation was successful.
         * After that the reader will wait for a finger placed on the reader.
         * When a finger is placed, a {@link QualityReported} event will report a scan quality,
         * and a {@link SamplesAcquired} event will return a scanned sample in case of a successful scan.
         */
        startAcquisition(sampleFormat, deviceUid) {
            return this.channel.send(new Request(new Command(Method$1.StartAcquisition, core.Base64Url.fromJSON({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
                SampleType: sampleFormat,
            }))))
                .then();
        }
        /** Deactivates a fingerprint acquisition mode.
         * This call will produce a {@link AcquisitionStopped} event if deactivation was successful.
         * After that the reader will stop waiting for a finger.
         */
        stopAcquisition(deviceUid) {
            return this.channel.send(new Request(new Command(Method$1.StopAcquisition, core.Base64Url.fromJSON({
                DeviceID: deviceUid ? deviceUid : "00000000-0000-0000-0000-000000000000",
            }))))
                .then();
        }
        /** Converts WebSdk connectivity error to a fingerprint API event. */
        onConnectionFailed() {
            this.emit(new CommunicationFailed());
        }
        /** Converts WebSdk notification to fingerprint API events. */
        processNotification(notification) {
            switch (notification.Event) {
                case NotificationType$1.Completed:
                    const completed = JSON.parse(core.Utf8.fromBase64Url(notification.Data || ""));
                    return this.emit(new SamplesAcquired(notification.Device, completed.SampleFormat, completed.Samples));
                case NotificationType$1.Error:
                    const error = JSON.parse(core.Utf8.fromBase64Url(notification.Data || ""));
                    return this.emit(new ErrorOccurred(notification.Device, error.uError));
                case NotificationType$1.Disconnected:
                    return this.emit(new DeviceDisconnected(notification.Device));
                case NotificationType$1.Connected:
                    return this.emit(new DeviceConnected(notification.Device));
                case NotificationType$1.Quality:
                    const quality = JSON.parse(core.Utf8.fromBase64Url(notification.Data || ""));
                    return this.emit(new QualityReported(notification.Device, quality.Quality));
                case NotificationType$1.Stopped:
                    return this.emit(new AcquisitionStopped(notification.Device));
                case NotificationType$1.Started:
                    return this.emit(new AcquisitionStarted(notification.Device));
                default:
                    console.log(`Unknown notification: ${notification.Event}`);
            }
        }
    }

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
    class WindowsAuthClient extends MultiCastEventSource {
        /**
         * Constructs a new IWA API object.
         * @param options - options for the `WebSdk` channel.
         */
        constructor(options) {
            super();
            this.channel = new Channel("wia", options);
            this.channel.onCommunicationError = this.onConnectionFailed.bind(this);
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
        on(event, handler) { return this._on(event, handler); }
        /** Deletes an event handler for the event.
         * @param event - a name of the event to subscribe.
         * @param handler - an event handler added with the {@link WindowsAuthClient.on} method.
         */
        off(event, handler) { return this._off(event, handler); }
        /** Used internally. Do not call this method. */
        init() {
            return this.channel.send(new Request(new Command(Method$2.Init)), 3000)
                .then(response => {
                const data = JSON.parse(response.Data || "{}");
                return { handle: data.Handle, data: data.Data };
            });
        }
        /** Used internally. Do not call this method. */
        continue(handle, data) {
            return this.channel.send(new Request(new Command(Method$2.Continue, JSON.stringify({ Handle: handle, Data: data }))))
                .then(response => {
                const d = JSON.parse(response.Data || "{}");
                return d.Data;
            });
        }
        /** Used internally. Do not call this method. */
        term(handle) {
            return this.channel.send(new Request(new Command(Method$2.Term, JSON.stringify({ Handle: handle }))))
                .then();
        }
        /** Converts WebSdk connectivity error to an IWA API event. */
        onConnectionFailed() {
            this.emit(new CommunicationFailed());
        }
    }

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
