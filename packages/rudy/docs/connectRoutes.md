# connectRoutes

`connectRoutes` is the primary "work" you will do to get **Redux First Router**
going. It's all about creating and maintaining a pairing of _action types_ and
dynamic express style route paths. If you use our `<Link />` component and pass
an _action_ as its `href` prop, you can change the URLs you use here any time
without having to change your application code.

In general, once you set this up, the only "work" you should expect to do in
your component code is diligent use of the `<Link />` component to specify what
actions/URLs will be dispatched, and perhaps more importantly what markup will
be written to the page. You can get the same effect of the address bar changing
just by dispatching actions bound as event handlers like you usually do, but
that doesn't get you `<a>` tags embedded in the page for search engines to pick
up.

To get the benefits of SEO, the changes to your workflow are minor. It's an
inversion of control where you now specify actions in your components rather
than `mapDispatchToProps` handlers. Once you get used to it, it will take very
little discpline to make this your new way of operating.

Lastly, it's not that you can't still use `mapDispatchToProps`--you just won't
want to in order to get SEO benefits for actions that you want to change the
address bar (and allow the user to _back/next_ through using the browser
buttons). To learn more about how to create links, check out our
[Link component](https://github.com/faceyspacey/redux-first-router-link).

Let's now examine our `connectRoutes` function more deeply:

## Signature

```javascript
connectRoutes(
  history: History,
  routesMap?: RoutesMap,
  options?: Options,
) : {
  middleware: Function,
  enhancer: Function,
  reducer: Function,
  thunk: Function,
}
```

The only parameter `connectRoutes` expects is the `history` object. You won't
get much for that, but it won't break your redux store. The second parameter is
your all-important `routesMap`. And the third is a small set of `options` in a
map that you can provide.

Let's dive into each.

## History

The `history` object is the return of the _history_ package's
`createBrowserHistory` or `createMemoryHistory` function:

```
import createHistory from 'history/createBrowserHistory'
const history = createHistory() // notice no parameters are needed in the browser
const { middleware, enhancer, reducer } = connectRoutes(history)
```

_or:_

```
import createHistory from 'history/createMemoryHistory'
const history = createHistory({ initialEntries: [request.path] })
const { middleware, enhancer, reducer } = connectRoutes(history)
```

See the widely used [history package](https://github.com/ReactTraining/history)
on github. The idea is simply that you can use both interchangeably depending on
if you're in the browser or an environment that does not have `window` or
`window.history` such as the server, React Native or tests (note: Jest does have
a fake functioning `window` object, so in Jest tests, you should use
`createMemoryHistory` to keep tests isolated).

When using `createMemoryHistory` the key is to to provide the initial path as
the value (within an array) for `initialEntries`. On the server this is easy
because you can get it from your `request` object such as when using _express_.
In tests, you can set it to whatever you want to trick **Redux First Router**
into thinking the app is starting on whatever route you want. In React Native,
you get it via the `Linking` API like this:

```javascript
import { connectRoutes } from 'redux-first-router'
import createHistory from 'history/createMemoryHistory'
import { Linking } from 'react-native'
import config from '../config'

const env = 'development' // should dynamically come from environment variables

const url = await Linking.getInitialURL()
const delimiter = config(env).URI_PREFIX || '://'
const path = url ? `/${url.split(delimiter)[1]}` : '/'
const history = createHistory({ initialEntries: [path] })

const { middleware, enhancer, reducer } = connectRoutes(history)
```

## Routes

The `routes` was pretty much covered in the [readme](../README.md), but to be
thorough, we'll explain it in depth, as well as describe the missing details
about the `toPath` and `fromPath` functions. Here's its _Flow type_:

```javascript
type Routes = {
  [key: string]: string | RouteObject,
}

type RouteObject = {
  path: string,
  capitalizedWords?: boolean,
  toPath?: (value: string, key?: string) => string,
  fromPath?: (pathSegment: string, key?: string) => string,
  thunk?: (dispatch: Function, getState: Function) => Promise<any>,
}
```

_note: one very important thing to note about the resulting dispatched actions
is that the payload is expected to always be an object. When using_ **Redux
First Router**, _do not dispatch payloads that are primitives such as `number`
or `string`._

Features:

- **route as a string** is simply a path to match to an action type without any
  transformations
- **capitalizedWords** when true will break apart hyphenated paths into words,
  each with the first character capitalizedWords
- **toPath** will one-by-one take the keys and values of your payload object and
  transform them into path segments. So for a payload with multiple key/value
  pairs, it will call `toPath` multiple times, passing in the individual value
  as the first argument and the individual key name as the second argument.
- **fromPath** will do the inverse, taking each dynamic path _:segment_ and its
  name (in this case "segment") and pass it to `fromPath` multiple times. The
  first argument is the segment and the second its name as delinated in your
  `routesMap` object after colons.
- **thunk** is a function just like what you dispatch when using the
  `redux-thunk` middleware, taking `dispatch` and `getState` arguments. NOTE:
  you do NOT need `redux-thunk` for this to work. On the client, the thunk will
  be called any time the middleware detects a matching route. However to
  properly manage server-side rendering, there are 2 optimizations: 1) on first
  load on the client _if server side rendering is detected_, it will not be
  called because it will be assumed to have been handled on the server and the
  `initialState` on the client hydrated from that. 2) on the server, on first
  load, it also WILL NOT be called because it is expected to be handled manually
  in order to allow you to syncronously `await` its result before sending your
  HTML to the client. See the
  [server side rendering](./docs/server-rendering.md) doc for the idiomatic way
  to do this.

## Options

Lastly, let's talk about the `options` you can provide. Here's its flow type:

```javascript
type Options = {
  location?: string | Function, // default: state => state.location
  title?: string | Function, // default: state => state.title
  selectLocationState?: (state: Object) => LocationState,
  selectTitleState?: (state: Object) => string,
  scrollTop?: boolean,
  restoreScroll?: (
    (PrevLocationState, LocationState) => boolean | string | array,
  ) => ScrollBehavior,
  onBeforeChange?: (Dispatch, GetState) => void,
  onAfterChange?: (Dispatch, GetState) => void,
  initialDispatch?: boolean, // default: true
  onBackNext?: (Dispatch, GetState, HistoryLocation, Action) => void,
  querySerializer?: { parse: Function, stringify: Function },
}
```

- **location** - the `location` lets you specify where in your Redux state tree
  **Redux First Router** should expect its reducer to be attached to. This can
  be omitted if you attache the reducer at `state.location`. If you provide a
  function `location` allows you to provide custom logic for getting the piece
  of state. This is especially useful for non-standard state shapes, such as
  Immutable.js. For example, if `state` is an instance of `Immutable.Map` you
  might have `state => state.get('location')`.

- **title** - the `title` is similarly the name of the state key for your page
  title or a selector function for getting it from state. **Redux First Router**
  will change your page title for you when the route changes, e.g.
  `document.title = 'foo'`. As with `location` you can provide a function here
  which can be useful if you need to implement custom logic to get at the title
  state. Example: `state => state.get('title')`.

- **notFoundPath** - the `notFoundPath` defaults to `'/not-found'`. The address
  gets redirected here in 2 situations: when you dispatch an action with no
  matching path, or if you manually call
  `dispatch(redirect({ type: NOT_FOUND }))`, where `NOT_FOUND` is an export from
  this package. The type in actions and state will be `NOT_FOUND`, which you can
  use to show a 404 page. Conversely, if the user visits a URL directly or if
  you dispatch `NOT_FOUND` without the redirect, the **_current URL is
  preserved_** but the `NOT_FOUND` type is _also_ dispatched, which is the
  correct way websites are typically supposed to deal with URLs they don't
  handle. _I.e. just like on Github.com, a 404 graphic will show and the URL
  stays the same._ So you will _rarely see_ `'/not-found'` unless you trigger it
  (intentionally or by accident). Lastly if you specify `notFoundPath: null`, in
  the aforementioned scenarios, the URL will display as the previous URL (i.e.
  the URL currently in the address bar) and fallback to `'/'`, such as in SSR if
  no history exists yet.

- **scrollTop** - the `scrollTop` option calls `window.scrollTo(0, 0)` on route
  changes so the user starts each page at the top. This is a _"poor man's"_
  scroll restoration, and should be fine while developing, especially if you're
  using Chrome. Though hash links won't fully function. See the next option for
  full-on scroll restoration support.

- **restoreScroll** - the `restoreScroll` is a call to
  `redux-first-router-restore-scroll`'s `restoreScroll` function, with a
  `shouldUpdateScroll` callback passed a single argument. See the
  [scroll restoration doc](./scroll-restoration.md) for more info.

- **onAfterChange** - `onAfterChange` is a simple function that will be called
  after the routes change. It's passed your standard `dispatch` and `getState`
  arguments like a thunk.

- **onBeforeChange** - `onBeforeChange` is a simple function that will be called
  before the routes change. It's passed your standard `dispatch` and `getState`
  arguments like a thunk, as well as the `action` as a third parameter. Keep in
  mind unlike `onAfterChange`, the action has not been dispatched yet.
  Therefore, the state won't reflect it. So you need to use the action to
  extract URL params from the `payload`. You can use this function to
  efficiently short-circuit the middleware by calling
  `dispatch(redirect(newAction))`, where `newAction` has the matching `type` and
  `payload` of the route you would like to redirect to. Using `onBeforeChange`
  and `location.kind === 'redirect'` + `res.redirect(301, pathname)` in your
  `serverRender` function is the idiom here for handling redirects server-side.
  See [server-rendering docs](.server-rendering.md) for more info.

- **onBackNext** - `onBackNext` is a simple function that will be called
  whenever the user uses the browser _back/next_ buttons. It's passed your
  standard `dispatch` and `getState` arguments like a thunk. Actions with kinds
  `back`, `next`, and `pop` trigger this.

- **initialDispatch** - `initialDispatch` can be set to `false` to bypass the
  initial dispatch, so you can do it manually, perhaps after running sagas. An
  `initialDispatch` function will exist in the object returned by
  `connectRoutes`. Simply call `initialDispatch()` when you are ready.

- **navigators** - `navigators` is a map of of your Redux state keys to _React
  Navigation_ navigators. Here's how you do it:

```js
import reduxNavigation from 'redux-first-router-navigation'

const options = {
  navigators: reduxNavigation({
    myStack: MyStackNavigator,
  }),
}
```

- **querySerializer** - an object with `parse` and `stringify` methods, such as
  the `query-string` or `qs` libraries (or anything handmade). This will be used
  to handle querystrings. Without this option, querystrings are ignored
  silently.

> See the [Redux Navigation](./redux-navigation) docs for info on how to use
> _React Navigation_ with this package. We think you're gonna love it :)

## Returned Values

`connectRoutes` returns an `enhancer` and a `middleware` that you will need to
use in order to tie everything together. It should be noted that the order that
those values are applied to the store _does matter_. The enhancer must come
first in order for the middleware to correctly function.

The returned `reducer` expects its key in the root reducer to be at `location`,
unless specified otherwise via the `location` option (outlined above).

```js
import * as reducers from '../reducers/'
import * as otherMiddlewares from '../middlewares'
import { connectRoutes } from 'redux-first-router'
import { combineReducers, createStore, applyMiddleware, compose } from 'redux'

const { reducer, middleware, enhancer } = connectRoutes(history, routesMap)

const rootReducer = combineReducers({ ...reducers, location: reducer })
const middlewares = applyMiddleware([middleware, ...otherMiddlewares])
// note that the enhancer comes before other middleware
const store = createStore(
  rootReducer,
  compose(
    enhancer,
    middlewares,
  ),
)
```
