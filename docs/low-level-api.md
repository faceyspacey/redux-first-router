# Low-level API

Below are some additional methods we export. The target user is package authors. Application developers will rarely need this.

## `actionToPath` and `pathToAction`
These methods are also exported:

```javascript
import { actionToPath, pathToAction } from 'redux-first-router'

const { routesMap } = store.getState().location

const path = actionToPath(action, routesMap, querySerializer)
const action = pathToAction(path, routesMap, querySerializer, basename, strict)
```

The `querySerializer`, `basename`, and `strict` arguments are optional.

The `querySerializer` argument is the same as the one passed to `connectRoutes`.
It defaults to undefined.

The `basename` and `strict` arguments default to the value passed the last time `connectRoutes` was called.
The `basename` argument works the same way as the one passed to `routesMap`.
`actionToPath` does not apply any `basename` transformation.
When `strict` is `true`, the presence or absence of a trailing slash is required to match the route path.

You will need the `routesMap` you made, which you can import from where you created it or you can
get any time from your store.

Our `<Link />` and `<NavLink />` components from [`redux-first-router-link`](https://github.com/faceyspacey/redux-first-router-link),
generates your links using these methods.


## `isLocationAction`

A simple utility to determine if an action is a location action transformed by the middleware. It can be useful if you want to know what sort of action you're dealing with before you decide what to do with it. You likely won't need this unless you're building associated packages.


## History

You can get access to the `history` object that you initially created, but from anywhere in your code without having to pass it down:

```js
import { history } from 'redux-first-router'

// notice that you must call it as a function
history().entries.map(entry => entry.pathname)
history().index
history().length
history().action
// etc
```

Keep in mind `history()` will return undefined until you call `connectRoutes`. This is usually fine, as your store configuration typically happens before your app even renders once.

View the [history package](https://www.npmjs.com/package/history) for more info.
