### Dispatching thunks on route changes

When a page depends on a resource, e.g. an API call, `redux-first-router` allows the route change itself to trigger the fetching of this resource by dispatching a thunk:

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

This is a key part of defining apps in terms of _routes_ instead of _components_. Compared to other approaches:
- It requires less actions because the initial "setup" action is implied by the route change.
- It avoids the common anti-pattern of triggering actions from components' lifecycle methods.
- It handles this basic use case without additional libraries such as [redux-thunk](https://github.com/reduxjs/redux-thunk) or [redux-saga](https://github.com/redux-saga/redux-saga).

### Pathless routes

A _pathless route_ is a `routesMap` entry that doesn't have a `path` key, and thus is neither dispatched as a result of a route change, nor does it change the address when dispatched.
While this might be a surprising concept when first learning about `routesMap`, it is a key ingredient in the vision of organizing apps by defining all "loading" actions in the same place and same manner.

### Demo

See the patch in this path for a minimalistic implementation of [The Star Wars API](https://swapi.co/) which showcases both thunks and pathless routes.
