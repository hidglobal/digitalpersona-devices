---
layout: default
title: Library Maintenance
has_toc: false
nav_order: 5
---
{% include header.html %}

# Library Maintainance

## Recommended Tools

Recommended **package manager** is [yarn](https://yarnpkg.com). While `npm` can be also used, we find that it occasionally breaks and requires deleting the whole `node_modules` folder and all lock files and reinstalling all packages.

The recommended **IDE** is [Microsoft VS Code](https://code.visualstudio.com/), with the following extensions:

* [NPM Support for VS Code](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
* [TypeScript Linter](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin)
* [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
* [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

The recommended **local NPM registry** is [Verdaccio](https://verdaccio.org/). It is very simple to install and configure, and it allows you to test publishing of NPM modules locally without exposing your unfinished work to the whole world.

## Development Guides

* [Coding](code.md)
* [Building](build.md)
* [Testing](test.md)
* [Documenting](document.md)
* [Versioning](version.md)
* [Deploying](deploy.md)
