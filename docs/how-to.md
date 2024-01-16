---
layout: default
title: F.A.Q.
has_toc: false
nav_order: 3  
---
{% include header.html %}

# Frequently Asked Questions

## I want to use the library with React/Angular/{{other framework}}

The `@digitalpersona/devices` is a browser-side library, so it does not depend on a web server technology. We may have not a sample code using specifically your framework, but it is basically the same routine for any web application, [outlined in a tutorial](https://hidglobal.github.io/digitalpersona-devices/tutorial.html):

1. load the `@digitalpersona/devices` and [`WebSdk`](https://github.com/hidglobal/digitalpersona-devices/tree/master/%40types/WebSdk) JS libraries into the web page served by your web application.
2. add your own JS code to the page, intiating fingerprint acquisition at the right moment, handling device events and sending collected biometric samples to your authentication server (or to the DigitalPersona Authentication Server).
3. make sure users of your web application have installed the DigitalPersona Lite Client on their machines, for example, handle device connection failures with a message containing a Lite Client download link.

## I use NodeJS and I get an error "WebSdk dependency not found"

The `@digitalpersona/devices` library is a *browser-only* library, it cannot be run in the NodeJS!

Make sure you load both the `@digitalpersona/devices` **and** the  [`WebSdk`](https://github.com/hidglobal/digitalpersona-devices/tree/master/%40types/WebSdk) modules into the web page using regular `<script>` tags.

If you use a bundler like Webpack, make sure you [configured it]({{ site.data.product.sampleRepoBaseUrl }}/build/webpack/prod.js) so that WebSdk is loaded as an "external" (or "global") module, and that the `@digitalpersona/devices` is also makes its way into the browser bundle, but not into the server-side NodeJS code.

## How to match collected fingerprints in a browser?

It is a bad practice to run fingerprint matching in a browser, because browsers are untrusted, and results of your verification can be easily replaced by a malicious JavaScript code. You should use a trusted authentication server instead.

## Can I use this library for fingerprints matching and user authentication?

This library runs in a browser and performs only fingerprint capturing. It does not do any fingerprint matching, see the previuos answer to understand why.

For fingerprint matching, you need to use some proven and certified fingerprint matching engine, like `FingerJet` (can be obtained with DigitalPersona U-are-U SDK or as a part of the [DigitalPersona Authentication Server]({{site.data.product.digitalPersonaUrl}})) or similar. 

## I need a code for fingerprint matching, using NodeJS/ASP.NET/Python/{{other language}}

It is a bad security practice to implement your own fingerprint matching engine, unless you do it for study or research. Fingerprint matching engines use hard math, proprietary algorithms, and they are resource-demanding, so they are usually implemented in some native language "closer to the metal" (C, C++ etc), Best engines are certified by NIST or other trusted agency.

Again, we suggest to use some proven and certified fingerprint matching engine like `FingerJet` (part of [HID DigitalPersona]({{site.data.product.digitalPersonaUrl}}) products) or similar.

If you're not DigitalPersona customer yet, then please contact [HID Global]({{site.data.product.hidCustomerServiceUrl}}) sales team.

## I want my own solution for fingerprint matching

Alternatively, you can try to deploy your own fingerprint matching engine. The fingerprint sample format is compatible with ANSI/ISO fingerprint template standards, which should be recognized by engines adhering standards. You can also collect raw fingerprint images and send them to the fingerprint engine of your choice.
