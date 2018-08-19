# Hacking

## Setup/installation

```shell
git clone git@github.com:ScriptedAlchemy/redux-first-router.git
yarn
yarn run lerna bootstrap
```

## Running the example/boilerplate

To run the example boilerplate app and easily hack on it and/or rudy,
you need to do two things:

1. Run a watching compilation of `rudy`: `cd packages/rudy && yarn run build:es --watch`
2. Run the development server for the boilerplate: `cd packages/boilerplate && yarn run start`

Then you can use the boilerplate at `http://localhost:3000`. You can edit the source code in `packages/rudy` and in `packages/boilerplate` and the
server/browser will update accordingly, including HMR and with source maps.

## Debugging

You can use the usual methods to debug errors in the browser. If there are bugs
that prevent the server from serving the page you want to debug, you can debug
the node process. There is a working debug configuration for Visual Studio Code
in `.vscode/launch.json`. You can use a similar configuration to debug using any node.js
debugger.

## Changing dependencies

`yarn`, `yarn add` etc do not work in the sub packages because the packages are
not yet published on npm. Instead you can:

### Add new dependencies

```shell
yarn run lerna add <new-dependency> [--scope=<boilerplate|rudy>] [<--dev|-D>]
```

### Upgrade or remove dependencies

(Or other things not supported by `lerna`)

1. Edit the appropriate `package.json` file
2. `yarn run lerna bootstrap` in the root directory
