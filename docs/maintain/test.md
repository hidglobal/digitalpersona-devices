---
layout: default
title: Testing
has_toc: false
nav_exclude: true
---
{% include header.html %}

# Testing

## Running tests

To run unit tests, perform one of the following steps.
* from terminal: run `npm run test`
* from VS Code: menu `Terminal` > `Run Task...` > [npm: test]
* if you have installed the [NPM Support for VS Code](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
  plugin: press `Ctrl-R, T`.

## Writing tests

For unit tests, we use following the tools.
* [Karma](https://karma-runner.github.io/) as a test runner
* [Jasmine](https://jasmine.github.io/) as a testing framework
* [fetch-mock](http://www.wheresrhys.co.uk/fetch-mock/) to mock the [`fetch` API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API)
