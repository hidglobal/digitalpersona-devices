---
layout: default
title: Overview
has_toc: false
nav_order: 1  
---
{% include header.html %}
<BR>  

# Overview
{% include dpam-intro.md %}

{% include websdk-intro.md %}

As a part of {{ site.data.product.shortName }}, the {{ site.data.lib.name }} library
[[{{ site.data.lib.package }}]({{ site.data.lib.npm }})]
provides Typescript/Javascript classes and functions allowing to communicate with authentication 
devices such as fingerprint readers and card readers from web browser. The secure communication 
channel is provided by DigitalPersona WebSDK agent.

## External dependencies

The library requires:
* a HID DigitalPersona WebSdk JavaScript library loaded into the browser.
* a [HID DigitalPersona Workstation](https://www.hidglobal.com/products/software/digitalpersona/digitalpersona)
**or** [HID DigitalPersona Lite Client](https://www.crossmatch.com/AltusFiles/AltusLite/digitalPersonaClient.Setup64.exe)
installed on the local machine.

The DigitalPersona Workstation provides a local Windows service and a user agent
which communicate with the hardware and provide a secure messaging channel for Javascript running 
in a browser. The DigitalPersona WebSdk is a browser's end of this channel.

NOTE: Currently WebSdk is provided either with the [HID DigitalPersona Suite](https://www.hidglobal.com/products/software/digitalpersona/digitalpersona),
or can be downloaded separately from [the sample](https://github.com/hidglobal/digitalpersona-sample-angularjs/tree/2c54be9c09434bdac39298162e4e6ff7316038c7/src/modules/WebSdk).

DEVELOPERS NOTE: Make sure you add the WebSdk library code into your web page only,
[using a `script` tag](https://github.com/hidglobal/digitalpersona-sample-angularjs/blob/2c54be9c09434bdac39298162e4e6ff7316038c7/src/index.html#L31).
A common mistake is to import the WebSdk code into your JS. You [can do `import`](https://github.com/hidglobal/digitalpersona-sample-angularjs/blob/2c54be9c09434bdac39298162e4e6ff7316038c7/src/index.ts#L11) only for typings.

To process fingerprint samples acquired using the `@digitalpersona/devices` (for enrollment and authentication), you should either use [HID DigitalPersona Authentication Server](https://www.hidglobal.com/products/software/digitalpersona/digitalpersona) together with `@digitalpersona/enrollment` and `@digitalpersona/authentication` libraries, or use your own fingerprint matching engine. Fingerprint samples are compatible with ANSI/ISO fingerprint template standards.

## Requirements

{% include reqs/browsers.md %}

{% include reqs/languages.md %}

### Browser support

{% include shims/promise.md %}

{% include shims/dp-web-sdk.md %}

{% include shims/websocket.md %}

### Node JS support

This library does not support Node JS.

## Additional documentation

* [Tutorial](./tutorial.md)
* [How-to](./how-to.md)
* [Reference](./reference.md)
* [Library Maintenance](./maintain/index.md)
