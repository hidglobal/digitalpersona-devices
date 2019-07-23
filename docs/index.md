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

The library depends on a DigitalPersona Composite Autentication Workstation (DPCA Workstation) 
installed on the local machine. The DPCA Workstation provides a local Windows service and a user agent
which communicate with the hardware and provide a secure messaging channel for Javascript running 
in a browser.

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
