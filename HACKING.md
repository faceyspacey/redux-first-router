# Hacking

## Setup/installation

```shell
git clone git@github.com:ScriptedAlchemy/redux-first-router.git
yarn
```

## Running the example/boilerplate

To run the example boilerplate app and easily hack on it and/or rudy, you need
to do two things:

1. Run a watching compilation of `rudy`:
   `cd packages/rudy && yarn run build:es --watch`
2. Run the development server for the boilerplate:
   `cd packages/boilerplate && yarn run start`

Then you can use the boilerplate at `http://localhost:3000`. You can edit the
source code in `packages/rudy` and in `packages/boilerplate` and the
server/browser will update accordingly, including HMR and with source maps.

## Debugging

You can use the usual methods to debug errors in the browser. If there are bugs
that prevent the server from serving the page you want to debug, you can debug
the node process. There is a working debug configuration for Visual Studio Code
in `.vscode/launch.json`. You can use a similar configuration to debug using any
node.js debugger.
