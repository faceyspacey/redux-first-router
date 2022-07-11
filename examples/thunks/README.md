### Dispatching thunks on route changes

When a page depends on a resource (e.g. an API call), the route change can implicitly trigger a _thunk_ (an async action) to fetch it:

```js
const routesMap = {
  HOME: {
    path: '/',
    thunk: (dispatch, getState) => {
      // const { myParams } = getState().location.payload;
      // const response = await fetch(...)
      // dispatch({ type: 'FETCH_READY', ... })
    }
  }
}
```

This is a fundamental part of `redux-first-router` which has several benefits compared to other routers:
- It requires fewer actions because the initial "setup" action is implied by the route change.
- It keeps global state decoupled from components and their lifecycle methods, and helps to maintain a top-down app structure. In particular it avoids the anti-pattern of triggering actions from `componentDidMount`.
- It achieves this without depending on additional libraries such as [redux-thunk](https://github.com/reduxjs/redux-thunk) or [redux-saga](https://github.com/redux-saga/redux-saga).

### Pathless routes

A _pathless route_ is a `routesMap` entry without a `path`, which thus is not dispatched as a result of any route change and does not affect the address when dispatched.
While this might be a surprising concept when first learning about `routesMap`, it is a key ingredient in the vision of organizing apps by defining all "loading" actions in the same place and same manner.

### Demo

The patch contains a minimalistic implementation of [The Star Wars API](https://swapi.dev/) which showcases the above concepts.
After applying it, see the relevant parts in action by navigating to **/swapi/people/1** and **/swapi/invalid/route**.
