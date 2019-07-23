---
layout: default
title: Coding Guidelines
has_toc: false
nav_exclude: true
---
{% include header.html %}

# Coding Guidelines

This library uses TypeScript as the primary coding  language. It is transpiled to Javascript (`es5` and `es6` platforms).

## Library size

The library may be used in mobile apps, so it is **critically important** to keep the library size as small as possible!

## ECMAScript standards and APIs

The library attempts to follow the most modern ECMAScript standards, but support for the `es5` platform incurs some restrictions.

Rules of thumb are:

* If there is a modern ECMAScript API which has `es5` shims available, prefer to follow the modern standard and let the end user provide a shim.
* If there is modern ECMAScript syntax which can be transpiled to `es5` without a large overhead, use the newer syntax, otherwise use the older equivalent.

### ES6 Async/await syntax

Despite a recommendation to use the `async/await` pattern everywhere, we avoid it in the main library code and prefer the `promise().then().catch()` pattern instead. This allows us to reduce the size of es5-transpiled code, avoiding a rather large (~1.5Kb minified) overhead of the `generator/awaiter` shim inserted by TypeScript.

This policy can be reviewed should support of `es5` platform be dropped.

It is still recommended to use the `async/await` pattern in unit tests, as code size is not critical there.

### ES6 Object Spread syntax

The ES6 object spread syntax adds an overhead to the es5-transpiled code, but it is negligible compared to the manual object merging, so it is ok to use it.

## Modular design

The library uses the TypeScript/ES2015 module system. It is critical to understand what modules are and are not.

### Do not use namespaces!

Module is a "namespace" by itself because the module consumer will give a named scope for all exports of the module, e.g: `import * as shapes from './Shapes'` or `var shapes = require('./Shapes')`.  

There is no need to create your own namespaces in the library.

### Keep every module as small as possible!

It is ok to have a single export class/enum/interface per module.  

This allows "tree-shaking" algorithms to work more effectively when the final JS bundle is created, 
thus potentially reducing the size of the bundle.  

To avoid long imports you can group several modules
in a larger super-module using a "barrel" module approach, i.e.  
- Create an `index.ts` file which re-exports
every sub-module, and
- Import the `index.ts` instead of the individual sub-modules.

### Do not bundle prematurely!

Prefer to keep your modules pure and unbundled, as premature bundling may reduce tree-shaking effeciveness.  

If you deliver your library in formats like `commonjs` or `umd`, the benefit is that they are immediately ready to load into a browser, but a downside is that bundlers
like Webkpack, Browserify, Rollup or Parcel have a hard time removing unnecessary code.  

As your library consumer most probably will use a bundler, it is better to let the end user  generate the bundle from pure ES2015 modules.  

The `commonjs` or `umd` modules can be provided as a convenience only and should not be consumed directly.
