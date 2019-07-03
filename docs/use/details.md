# Details

## External dependencies

The library depends on a DigitalPersona Composite Autentication Workstation (DPCA Workstation) 
installed on the local machine. The DPCA Workstation provides a local Windows service and a user agent
which communicate with the hardware and provide a secure messaging channel for Javascript running 
in a browser.

## Browser support

The library uses the ES6 `promise` browser API for asynchronous calls. If it is used in older browsers,
you have to provide a "shim" adding the `promise` API to your target browser.

The library uses ES6 `fetch` browser API for HTTP conenction. If it is used in older browsers,
you have to provide a "shim" adding the `fetch` API to your target browser.

The library uses the `DPCA WebSDK` library which uses [`websocket` browser API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
for streaming authentication data and messages. Browsers not supporting `WebSocker Standard RFC 6455`
are not supported.
