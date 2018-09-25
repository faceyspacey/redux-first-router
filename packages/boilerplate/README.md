<a href="https://codesandbox.io/s/github/faceyspacey/redux-first-router-codesandbox" target="_blank">
  <img alt="Edit Redux-First Router Demo" src="https://codesandbox.io/static/img/play-codesandbox.svg">
</a>

# Simple Universal Boilerplate of [Redux-First Router](https://github.com/faceyspacey/redux-first-router)

![redux-first-router-demo screenshot](./screenshot.png)

> For a demo/boilerplate that goes even farther make sure to check out the
> **["DEMO"](https://github.com/faceyspacey/redux-first-router-demo)**. A lot
> more features and use-cases are covered there, but this _boilerplate_ is the
> best place to start to learn the basics of RFR, especially if you're new to
> any of these things: SSR, Code Splitting, Express, APIs, Webpack and Redux in
> general.

## Installation

```
git clone https://github.com/faceyspacey/redux-first-router-boilerplate
cd redux-first-router-boilerplate
yarn
yarn start
```

## Files You Should Look At:

_client code:_

- [**_src/configureStore.js_**](./src/configureStore.js)
- [**_src/routesMap.js_**](./src/routesMap.js) - **_(the primary work of RFR)_**
- [**_src/components/Switcher.js_**](./src/components/Switcher.js) - _(universal
  component concept)_
- [**_src/components/Sidebar.js_**](./src/components/Sidebar.js) - _(look at the
  different ways to link + dispatch URL-aware actions)_

_server code:_

- [**_server/index.js_**](./server/index.js)
- [**_server/render.js_**](./server/render.js) - \*(super simple thanks to
  [webpack-flush-chunks](https://github.com/faceyspacey/webpack-flush-chunks)
  from our **_"Universal"_** product line)\*
- [**_server/configureStore.js_**](./server/configureStore.js) - **_(observe how
  the matched route's thunk is awaited on)_**
