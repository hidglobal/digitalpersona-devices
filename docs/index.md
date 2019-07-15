---
layout: default
title: Overview
has_toc: false
nav_order: 1  
---
{% include header.html %}

# JavaScript Client for DigitalPersona Device Access

{% include websdk-intro.md %}

This library communicates with the DP WebSDK agent via a secure message channel,
allowing to implement composite authentication on web pages.

## External dependencies

The library depends on a DigitalPersona Composite Autentication Workstation (DPCA Workstation) 
installed on the local machine. The DPCA Workstation provides a local Windows service and a user agent
which communicate with the hardware and provide a secure messaging channel for Javascript running 
in a browser.

## Requirements

{% include reqs/platforms.md %}

{% include reqs/languages.md %}

### Browser support

{% include shims/promise.md %}

{% include shims/dp-web-sdk.md %}

{% include shims/websocket.md %}

### Node JS Support

This library does not support Node JS.

## Additional documentation:

* [Tutorial](./tutorial.md)
* [How-to](./how-to.md)
* [Reference](./reference.md)
