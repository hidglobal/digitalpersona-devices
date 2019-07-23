---
layout: default
title: Tutorial
has_toc: false
nav_order: 2
---
{% include header.html %}

# Tutorial

## Getting started

### Add the package to your project

Using NPM:

```
npm install {{site.data.lib.package}}
```

Using Yarn:

```
yarn add {{site.data.lib.package}}
```

### Write some code

We recommend using Typescrypt or ES6 modules.

## Using Components

> For working examples see a [“Bank of DigitalPersona”](https://github.com/hidglobal/digitalpersona-sample-angularjs)
sample application.

### Fingerprints Reader


Import needed types from the @digitalpersona/devices module, for example:

```
import { FingerprintReader, SampleFormat } from '@digitalpersona/devices';
...

class FingerprintSigninControl
{
    private reader: FingerprintReader;

    ...
}

```

Create an instance of a `FingerprintReader` class and subscribe to its events:

```
class FingerprintSigninControl
{
    function init() {
        this.reader = new FingerprintReader();
        this.reader.on("DeviceConnected", this.onDeviceConnected);
        this.reader.on("DeviceDisconnected", this.onDeviceDisconnected);
        this.reader.on("QualityReported", this.onQualityReported);
        this.reader.on("SamplesAcquired", this.onSamplesAcquired);
        this.reader.on("ErrorOccurred", this.onReaderError);
        ...
    }
    
    // Event handlers.
    private onDeviceConnected    = (event) => { ... }
    private onDeviceDisconnected = (event) => { ... };
    private onQualityReported    = (event) => { ... };
    private onSamplesAcquired    = (event) => { ... };
    private onReaderError        = (event) => { ... };
}
```
Note how we use arrow functions here for event handlers. Unlike regular methods, arrow functions allow
correctly and effortlessly bind event handlers to the correct `this` value.

Start fingerprint acquisition:

```
class FingerprintSigninControl
{
    function async init() {
        ...
        try {
            await this.reader.startAcquisition(SampleFormat.Intermediate);
        } catch (err) {
            this.handleError(err);
        }
    }
}
```

When new samples are captured, send them to the server for identification (if user's identity
is not yet known) or authentication (if user's identity is already known):

```
    private onSamplesAcquired = (event: SamplesAcquired) =>
    {
        try {
            const samples = event.samples;
            const api = new FingerprintsAuth( <service endpoint URL> );
            const token = await (
                this.identity ? 
                    api.authenticate(this.identity, samples):
                    api.identify(samples));
            );
            this.notifyOnToken(token);
        }
        catch (error) {
            this.handleError(error);
        }
    }
```

When finished the work, unsubscribe from events and cleanup:

```
class FingerprintSigninControl
{
    ...

    function destroy() {
        this.reader.off();
        delete this.reader;
    }
}
```


### Card Reader

Import needed types from the @digitalpersona/devices module, for example:

```
import { CardsReader } from '@digitalpersona/devices';
...

class CardsSigninControl
{
    private reader: CardsReader;

    ...
}

```

Create an instance of a `CardsReader` class and subscribe to its events:

```
class CardsSigninControl
{
    function init() {
        this.reader = new CardsReader();
        this.reader.on("DeviceConnected", this.onDeviceConnected);
        this.reader.on("DeviceDisconnected", this.onDeviceDisconnected);
        this.reader.on("CardInserted", this.onCardInserted);
        this.reader.on("CardRemoved", this.onCardRemoved);
        ...
    }
    
    // Event handlers.
    private onDeviceConnected    = (event) => { ... }
    private onDeviceDisconnected = (event) => { ... };
    private onCardInserted       = (event) => { ... };
    private onCardRemoved        = (event) => { ... };
}
```
Note how we use arrow functions here for event handlers. Unlike regular methods, arrow functions allow
correctly and effortlessly bind event handlers to the correct `this` value.

Start listening for card events:

```
class CardsSigninControl
{
    function init() {
        ...
        try {
            await this.reader.subscribe();
        } catch (error) {
            this.handleError(error);
        }

    }
```

When a card is presented, first detect its type, then handle the card depending on a card type.
For smartcards: prompt user to enter PIN and start authentication when PIN is entered.
Contactless and proximity cards can be used for athentication immediately without entering any code:

```
class CardsSigninControl
{
    ...
    private onCardInserted = (event: CardInserted) =>
    {
        try {
            // get card type and other info
            const card = await this.reader.getCardInfo(event.deviceId);
            if (!card) return;

            this.card = card;
            switch (card.Type)
            {
                case CardType.Contact: {
                    const pin = await this.promptPIN();
                    const cardData = await this.reader.getCardAuthData(this.card.Reader, pin);
                    const api = new SmartCardAuth( <auth service endpoint URL> );
                    const token = await api.authenticate(this.identity, cardData);
                    this.notifyOnToken(token);
                    break;
                }
                case CardType.Contactless: {
                    const cardData = await this.reader.getCardAuthData(card.Reader);
                    const api = new ContactlessCardAuth( <auth service endpoint URL> );
                    const token = await (
                        this.identity ?
                            api.authenticate(this.identity, cardData) :
                            api.identify(cardData)
                    this.notifyOnToken(token);
                    break;
                }
                case CardType.Proximity: {
                    const cardData = await this.reader.getCardAuthData(card.Reader);
                    const api = new ProximityCardAuth( <auth service endpoint URL> );
                    const token = await (
                        this.identity ?
                            api.authenticate(this.identity, cardData) :
                            api.identify(cardData)
                    this.notifyOnToken(token);
                    break;
                }
                default:
                    throw new Error('unknown card type')
            }
        }
        catch (error) {
            this.handleError(error);
        }

    };

}
```

When finished the work, unsubscribe from events and cleanup:

```
class CardsSigninControl
{
    ...

    function destroy() {
        this.reader.off();
        delete this.reader;
    }
}
```
