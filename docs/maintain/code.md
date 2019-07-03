# Coding Guides

The library uses the TypeScript as a main language. It is transpiled to Javascript (`es5` and `es6` platforms).

## Library size

The library may be used in mobile apps, so it is **critically important** to keep the library size as small as possible!

## ECMAScript standards and APIs

The library tries to follow the most modern ECMAScript standards, but support of `es5` platform put some restrictions.
The rules of thumb are:

* If there is a modern ECMAScript API which has `es5` shims available, prefer to follow the modern standard and let
the end user to provide a shim.
* If there is modern ECMAScript syntax which can be transpiled to `es5` without large overhead, use the newer syntax, 
  otherwise use the older equivalent.

### ES6 Async/await syntax

Despite the recommendations to use `async/await` pattern everywhere, we avoid it in the main library code and prefer
`promise().then().catch()` pattern instead. This allows us to reduce es5-transpiled code size, avoiding overhead of 
a quite large (~1.5Kb minified) `generator/awaiter` shim inserted by TypeScript.

This policy can be reviewed after support of `es5` platform is dropped.

It is still recommended to use the `async/await` pattern in unit tests, as code size is not critical here.

### ES6 Object Spread syntax

The ES6 object spread syntax adds an overhead to the es5-transpiled code, but it is negligible comparing to the manual
object merging, so it is ok to use it.

## Modular design

The library uses TypeScript/ES2015 module system. You must understand what modules are and are not.

**Do not use namespaces!** Module is a "namespace" by itself because the module consumer will give
a named scope for all exports of the module, e.g: `import * as shapes from './Shapes'` or `var shapes = require('./Shapes')`.
There is no need to create your own namespaces in the library.

**Keep every module as small as possible!** It is ok to have a single export class/enum/interface per module. 
This allows "tree-shaking" algorithms to work more effectively when the final JS bundle is created, 
thus potentially reducing the size of the bundle. To avoid long imports you can group several modules 
in a larger super-module using a "barrel" module approach: create an `index.ts` file which re-exports
every sub-module, and you can import the `index.ts` instead of individual sub-modules.

**Do not bundle prematurely!** Prefer to keep your modules pure and unbundled, as premature bundling
may reduce tree-shaking effeciveness. If you deliver your library in formats like `commonjs` or `umd`,
the benefit is that they are immediately ready to load into a browser, but a downside is that bundlers
like Webkpack, Browserify, Rollup or Parcel have a hard time to remove unneeded code. As your library consumer
most probably will use a bundler, it is better to let the end user to generate the bundle from pure ES2015 modules.
The `commonjs` or `umd` modules can be provided as a convenience only and should not be consumed directly.
