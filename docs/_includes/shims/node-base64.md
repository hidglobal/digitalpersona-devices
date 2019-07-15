Node JS requires a "shim" for `atob` and `btoa` functions, for example:

```js
const base64 = require('base-64');
global.btoa = function(s) { return base64.encode(s); }
global.atob = function(s) { return base64.decode(s); }
```
