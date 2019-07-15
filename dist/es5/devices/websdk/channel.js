import { Base64Url, Utf8 } from '@digitalpersona/core';
import { MessageType } from './messages';
import 'WebSdk';
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
        var message = JSON.parse(Utf8.fromBase64Url(data));
        if (message.Type === MessageType.Response) {
            var response = JSON.parse(Utf8.fromBase64Url(message.Data || ""));
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
            var notification = JSON.parse(Utf8.fromBase64Url(message.Data || ""));
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
                _this.webChannel.sendDataTxt(Base64Url.fromJSON(req.command));
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
export { Channel };
//# sourceMappingURL=channel.js.map