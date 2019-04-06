# Information for developers

## Recommended Tools

Recommended **package manager** is [yarn](https://yarnpkg.com). While `npm` can be also used, sometimes
is gets broken and requires deleting the whole `node_modules` folder and all lock files and reinstall
all packages.

Recommended **IDE** is [Microsoft VS Code](https://code.visualstudio.com/), with folowing extensions:

* [NPM Support for VS Code](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
* [TypeScript Linter](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin)
* [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
* [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

Recommended **local NPM registry** is [Verdaccio](https://verdaccio.org/). Very simple to install
and configure, it allows you to test publishing of NPM modules locally, without exposing your unfinished
work to the whole world.

## Development Guides

* [Coding](coding.md)
* [Building](building.md)
* [Testing](testing.md)
* [Documenting](documenting.md)
* [Versioning](versioning.md)
* [Deployment](deployment.md)
