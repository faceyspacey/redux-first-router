# Reducer
The location reducer primarily maintains the state of the current `pathname` and action dispatched (`type` + `payload`). 
That's its core mission. 

In addition, it maintains similar state for the previous route on the `prev` key, as well as these booleans: 

* *load*: if the current route was the first route the app loaded on, `load` will be true
* *backNext*: if the user has used the browser back/forward buttons, `backNext` will be true
* *hasSSR*: if the app is utilizing server side rendering, `hasSSR` will be true. 

Lastly, your `routesMap` will also be stored for use by, for instance, *pure-redux-router-link's* `<Link />` component. 

Here's an example of the initialState that will be created for your location reducer:

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
  load: undefined,
  backNext: undefined,
  hasSSR: isServer() ? true : undefined,
  routesMap: {
    EXAMPLE: '/example/:param', 
  },
}
```


## Reducer
And here's a slightly simplified version of the `location` reducer that will ultimately be powering your app:

```javascript
const locationReducer = (state = initialState, action = {}) => {
  if (routesMap[action.type]) {
    return {
      pathname: action.meta.location.current.pathname,
      type: action.type,
      payload: { ...action.payload },
      prev: action.meta.location.prev,
      load: action.meta.location.load,
      backNext: action.meta.location.backNext,
      hasSSR: state.hasSSR,
      routesMap,
    }
  }

  return state
}
```


## Flow Type
To get a precise sense of what values your `location` reducer will store, here's its ***Flow*** type:

```javascript
type Location = {
  pathname: string,       // current path + action
  type: string,
  payload: Object,

  prev: {                 // previous path + action
    pathname: string,
    type: string,
    payload: Object,
  },

  load?: true,            // extra info
  backNext?: true,
  hasSSR?: true,

  routesMap: RoutesMap,   // your routes, for reference
}

type RoutesMap = {
  [key: string]: string | RouteObject,
}

type RouteObject = {
  path: string,
  capitalizedWords?: boolean,
  toPath?: (param: string, key?: string) => string,
  fromPath?: (path: string, key?: string) => string,
  thunk?: (dispatch: Function, getState: Function) => void,
}
```
