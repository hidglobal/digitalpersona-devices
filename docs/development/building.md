# Making a build

## Installing dependencies

To get started, install dependencies first:

```
cd ./device-access.js
npm install
```
<a name="code"></a>
## Build code

To build the library:

* from terminal: run `npm run-script build`, 
* from VS Code: press `Ctrl+Shift+B`

The build output (JavaScript files) will be put into following locations, according to a target:
* ES6 unbundled (for modern browsers): `./dist/es6/`
* ES5 bundled into UMD and IIFE (for older browsers): `./dist/es5/`


<a name="documentation"></a>
## Build documentation

To build API documentation:
* from terminal: run `npm run-script docs`

The build output (HTML and CSS files) will be put into a `./docs/` folder.
