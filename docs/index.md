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
* a [HID DigitalPersona Workstation]({{ site.data.product.digitalPersonaUrl }})
**or** [HID DigitalPersona Lite Client]({{ site.data.product.liteClientUrl }})
installed on the local machine.

The DigitalPersona Workstation provides a local Windows service and a user agent
which communicate with the hardware and provide a secure messaging channel for Javascript running 
in a browser. The DigitalPersona WebSdk is a browser's end of this channel.

NOTE: Currently WebSdk is provided either with the [HID DigitalPersona Suite]({{ site.data.product.digitalPersonaUrl }}),
or can be downloaded separately from [the sample]({{ site.data.product.sampleRepoBaseUrl }}/src/modules/WebSdk).

DEVELOPERS NOTE: Make sure you add the WebSdk library code into your web page only,
[using a `script` tag]({{ site.data.product.sampleRepoBaseUrl }}/src/index.html#L31).
A common mistake is to import the WebSdk code into your JS. You [can do `import`]({{ site.data.product.sampleRepoBaseUrl }}/src/index.ts#L11) only for typings.

To process fingerprint samples acquired using the `@digitalpersona/devices` (for enrollment and authentication), you should either use [HID DigitalPersona Authentication Server]({{site.data.product.digitalPersonaUrl}}) together with `@digitalpersona/enrollment` and `@digitalpersona/authentication` libraries, or use your own fingerprint matching engine. Fingerprint samples are compatible with ANSI/ISO fingerprint template standards.

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
