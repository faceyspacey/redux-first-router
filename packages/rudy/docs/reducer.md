# Reducer

The location reducer primarily maintains the state of the current `pathname` and
action dispatched (`type` + `payload`). That's its core mission.

In addition, it maintains similar state for the previous route on the `prev`
key, as well as the kind of action on the `kind` key. Here are the kinds you can
expect:

- _load_: if the current route was the first route the app loaded on, `load`
  will be true
- _redirect_: if the current route was reached as the result of a redirect
- _next_: if the current route was reached by going forward (and not a _push_)
- _back_: if the current route was reached by going back
- _pop_: if the user has used the browser back/forward buttons and we can't
  determine the direction (which is typical in the browser using
  `createBrowserHistory`. If you're using `createMemoryHistory`, the kind will
  know if you're going forward or back.)

If the app is utilizing server side rendering, a `hasSSR` key will be set to
true.

Lastly, your `routesMap` will also be stored for use by, for instance,
_redux-first-router-link's_ `<Link />` component.

Here's an example of the initialState that will be created for your location
reducer:

## Example Initial State

```javascript
const initialState = {
  pathname: '/example/url',
  type: 'EXAMPLE',
  payload: { param: 'url' },
  prev: {
    pathname: '',
    type: '',
    payload: {},
  },
  kind: undefined,
  hasSSR: isServer() ? true : undefined,
  routesMap: {
    EXAMPLE: '/example/:param',
  },
}
```

## Reducer

And here's a slightly simplified version of the `location` reducer that will
ultimately be powering your app:

```javascript
const locationReducer = (state = initialState, action = {}) => {
  if (routesMap[action.type]) {
    return {
      pathname: action.meta.location.current.pathname,
      type: action.type,
      payload: { ...action.payload },
      prev: action.meta.location.prev,
      kind: action.meta.location.kind,
      hasSSR: state.hasSSR,
      routesMap,
    }
  }

  return state
}
```

## Flow Type

To get a precise sense of what values your `location` reducer will store, here's
its **_Flow_** type:

```javascript
type Location = {
  pathname: string,       // current path + action
  type: string,
  payload: Object

  prev: {                 // previous path + action
    pathname: string,
    type: string,
    payload: Object
  },

  kind?: string,            // extra info
  hasSSR?: true,

  routesMap: RoutesMap    // your routes, for reference
}

type RoutesMap = {
  [key: string]: string | RouteObject
}

type RouteObject = {
  path: string,
  capitalizedWords?: boolean,
  toPath?: (param: string, key?: string) => string,
  fromPath?: (path: string, key?: string) => string,
  thunk?: (dispatch: Function, getState: Function) => Promise<any>
}
```

## History State (via `createMemoryHistory` only)

The `location` state and the `action.meta.location` object _on the server or in
environments where you used `createMemoryHistory` to create your history (such
as React Native)_ will also maintain information about the history stack. It can
be found within the `history` key, and this is its shape:

```javascript
type History: {
  index: number,          // index of focused entry/path
  length: number,         // total # of entries/paths
  entries: Entry          // array of objects containting paths
}

type Entry: {
  pathname: string
}
```

This is different from what the `history` package maintains in that you can use
Redux to reactively respond to its changes. Here's an example:

```js
import React from 'react'
import { connect } from 'react-redux'

const MyComponent = ({ isLast, path }) =>
  isLast ? <div>last</div> : <div>{path}</div>

const mapStateToProps = ({ location: { history } }) => ({
  isLast: history.index === history.length - 1,
  path: history.entries[history.index].pathname,
})

export default connect(mapStateToProps)(MyComponent)
```

> By the way, this example also showcases the ultimate goal of **Redux First
> Router:** _to stay within the "intuitive" workflow of standard Redux
> patterns_.

If you're wondering why such state is limited to `createMemoryHistory`, it's
because it can't be consistently maintained in the browser. Here's why:

[would it be possible for createBrowserHistory to also have entries and index? #441](https://github.com/ReactTraining/history/issues/441)

In short, the browser will maintain the history for your website even if you
refresh the page, whereas from our app's perspective, if that happens, we'll
lose awareness of the history stack. `sessionStorage` almost can solve the
issue, but because of various browser inconsitencies (e.g. when cookies are
blocked, you can't recall `sessionStorage`), it becomes unreliable and therefore
not worth it.

**_When might I have use for it though?_**

Well, you see the fake browser we made in our playground on _webpackbin_, right?
We emulate the browser's back/next buttons using it. If you have the need to
make such a demo or something similar, totally use it.
