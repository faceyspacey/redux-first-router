# Low-level API

Below are some additional methods we export. The target user is package authors.
Application developers will rarely need this.

## `actionToPath` and `pathToAction`

These methods are also exported:

```javascript
import { actionToPath, pathToAction } from 'redux-first-router'

const { routesMap } = store.getState().location

const path = actionToPath(action, routesMap)
const action = pathToAction(path, routesMap)
```

You will need the `routesMap` you made, which you can import from where you
created it or you can get any time from your store.

Our `<Link />` component,
[Redux First Router Link](https://github.com/faceyspacey/redux-first-router-link),
generates your links using these methods. It does so using the `store` Redux
makes available via `context` in order for all your links not to need to
subscribe to the `store` and become unnecessarilly reactive.

Unlike _React Router_ we do not offer a
[NavLink](https://reacttraining.com/react-router/#navlink) component as that
leads to unnecessary renders. That's why we using your store `context` instead.
The `routesMap` does not change, so we can get it once without responding to
reactive updates from your `location` reducer state.

We will however likely create a `<NavLink />` component in the future. Until
then, it's extremely easy to make yourself. You can do so in an ad hoc way
_without_ using `actionToPath` or `pathToAction` (just by using your
app-specific state), but if you'd like to abstract it, analyze the **Redux First
Router Link** code. Feel free to make a PR; we'd welcome a second export in that
package.

## `isLocationAction`

A simple utility to determine if an action is a location action transformed by
the middleware. It can be useful if you want to know what sort of action you're
dealing with before you decide what to do with it. You likely won't need this
unless you're building associated packages.

## History

You can get access to the `history` object that you initially created, but from
anywhere in your code without having to pass it down:

```js
import { history } from 'redux-first-router'

// notice that you must call it as a function
history().entries.map((entry) => entry.pathname)
history().index
history().length
history().action
// etc
```

Keep in mind `history()` will return undefined until you call `connectRoutes`.
This is usually fine, as your store configuration typically happens before your
app even renders once.

View the [history package](https://www.npmjs.com/package/history) for more info.
