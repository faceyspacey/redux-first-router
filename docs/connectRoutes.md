# connectRoutes

`connectRoutes` is the primary "work" you will do to get **Redux First Router** going. It's all about creating and maintaining
a pairing of *action types* and dynamic express style route paths. If you use our `<Link />` component and pass an *action* as
its `href` prop, you can change the URLs you use here any time without having to change your application code.

In general, once you set this up, the only "work" you should expect to do in your component code is diligent use of the `<Link />` component
to specify what actions/URLs will be dispatched, and perhaps more importantly what markup will be written to the page. You can get the same
effect of the address bar changing just by dispatching actions bound as event handlers like you usually do, but that doesn't get you
`<a>` tags embedded in the page for search engines to pick up.

To get the benefits of SEO, the changes to your workflow are minor. It's an inversion of control where you now specify actions in your components
rather than `mapDispatchToProps` handlers. Once you get used to it, it will take very little discpline to make this your new way of operating.

Lastly, it's not that you can't still use `mapDispatchToProps`--you just won't want to
in order to get SEO benefits for actions that you want to change the address bar (and allow the user to *back/next* through using the
browser buttons). To learn more about how to create links, check out our [Link component](https://github.com/faceyspacey/redux-first-router-link).

Let's now examine our `connectRoutes` function more deeply:

## Signature

```js
connectRoutes(
  routesMap?: RoutesMap,
  options?: Options,
) : {
  middleware: Function,
  enhancer: Function,
  reducer: Function,
  thunk: Function,
  initialDispatch: Function,
}
```

### Parameters

The first parameter is your all-important `routesMap`. The second is a small set of `options` in a map that you can provide.

Before diving into each, know that some of the callbacks described in `routesMap` and `options` will receive a `bag` parameter. Feel free to skim through its description below and come back to it later if you need.

`bag` has the value `{ action, extra }` where extra is a new optional value to set in `options` that works much like the `withExtraArgument` feature of `redux-thunk` or the context argument of GraphQL resolvers: any required context can be passed to your route callbacks without having to tightly couple them to it. For example a configured API client, or an addReducer function to dynamically inject reducers used by lazy-loaded components.

### Return value

`connectRoutes` returns an object with a Redux store middleware, enhancer, and reducer, to be used when [creating your Redux store](https://redux.js.org/api/createstore#arguments), and two functions to be used for [server side rendering](server-rendering.md):

- `thunk`: it should be called (and `await`ed) with a copy of your store state, then the corresponding thunk matching the current request path from your `routesMap` will be called.
- `initialDispatch`: it should be called only if you set `initialDispatch: false` in [options](#options), to initialize RFR (eg. after running sagas or some other kind of work to do before running RFR).

## RoutesMap

The `routesMap` was pretty much covered in the [readme](../README.md), but to be thorough,
we'll explain it in depth, as well as describe the missing details about the `toPath` and `fromPath` functions. Here's its
*Flow type*:

```js
type RoutesMap = {
  [key: string]: string | RouteObject,
}

type RouteObject = {
  path?: string,
  capitalizedWords?: boolean,
  toPath?: (value: string, key?: string) => string,
  fromPath?: (pathSegment: string, key?: string) => string,
  thunk?: (dispatch: Function, getState: Function, bag: ?Bag) => Promise<any>,
  confirmLeave?: ConfirmLeave,
}
```

*note: one very important thing to note about the resulting dispatched actions is that the payload is expected to always be an object. When using* **Redux First Router**, *do not dispatch payloads that are primitives such as `number` or `string`.*

Features:

* **path** (or the string passed in place of the object) is simply a URL pathname (just the path, not the query string) to match to an action type. You can implement basic cases by simply passing a literal path, e.g. `'/'` or `'/about'`. You can have dynamic segments by using a colon (e.g. `'/users/:userId'`). In this case, the corresponding action has a key `payload.userId` with the appropriate value. You can also implement more complex cases such as regular expressions, optional parameters, and multi segment parameters. See the docs on [URL parsing](./url-parsing.md) for more details. Path is **optional**. If you do not provide it, the action will not be synced with the URL, but you can still use the `thunk` option to declaratively specify which thunks will occur in response to which actions. See the [example](../examples/pathlessRoutes.js) for more details.
* **capitalizedWords** when true will break apart hyphenated paths into words, each with the first character capitalized
* **coerceNumbers** when true will parse numeric paths into Numbers (default false)
* **toPath** will one-by-one take the keys and values of your payload object and transform them into path segments. So for a payload with multiple key/value pairs, it will call `toPath` multiple times, passing in the individual value as the first argument and the individual key name as the second argument. If you do not provide a function, the default behaviour is to convert payload params with multiple segments into arrays containing each segment, and to apply the `capitalizedWords` transformation to other segments if that option is set. If you provide your own function, no other transformations are applied.
* **fromPath** will do the inverse, taking each dynamic path *:segment* and its name(in this case "segment") and passing it to `fromPath` multiple times. The first argument is the segment and the second its name as delinated in your `routesMap` object after colons. If `fromPath` is not provided, the default behaviour is to parse segments into numbers if possible, and otherwise to apply the `capitalizedWords` transformation if that option is set. If you pass a function to `fromPath`, no transformations occur other than those that your function performs.
* **thunk** is a function just like what you dispatch when using the `redux-thunk` middleware, taking `dispatch`, `getState`, and `bag` arguments. NOTE: you do NOT need `redux-thunk` for this to work. On the client, the thunk will be called any time the middleware detects a matching route. However to properly manage server-side rendering, there are 2 optimizations: 1) on first load on the client *if server side rendering is detected*, it will not be called because it will be assumed to have been handled on the server and the `initialState` on the client hydrated from that. 2) on the server, on first load, it also WILL NOT be called because it is expected to be handled manually in order to allow you to syncronously `await` its result before sending your HTML to the client. See the [server side rendering](./docs/server-rendering.md) doc for the idiomatic way to do this.
* **confirmLeave** is a function that can optionally block navigation away from the route. It receives the current redux state and the action as arguments. If you return a falsy value, navigation will be allowed. Otherwise, The default behaviour is to call `window.confirm` on attempted navigation, and display the string returned from `confirmLeave` as the message in the browser yes|no dialog. You can customize what happens when navigation is blocked using the `displayConfirmLeave` option to `routesMap` (see below). You must do this on react-native, since there is no `window.confirm`. In this case, you can return any type of value you want. See this [blocking navigation](./blocking-navigation.md) for more details


## Options

Lastly, let's talk about the `options` you can provide. Here's its flow type:

```js
type Options = {
  basename?: string,            // default: ''
  strict?: boolean,             // default: false
  location?: string | Function, // default: state => state.location
  title?: string | Function,    // default: state => state.title
  initialDispatch?: boolean,    // default: true
  initialEntries?: string | Array<string>,
  querySerializer?: {parse: Function, stringify: Function},
  notFoundPath?: string | null, // default: 'not-found'
  scrollTop?: boolean,          // default: false
  restoreScroll?: (history: History) => ScrollBehavior,
  onBeforeChange?: (dispatch: Dispatch, getState: GetState, bag: Bag) => void,
  onAfterChange?: (dispatch: Dispatch, getState: GetState, bag: Bag) => void,
  onBackNext?: (dispatch: Dispatch, getState: GetState, bag: Bag) => void,
  displayConfirmLeave?: DisplayConfirmLeave,
  createHistory?: (options?: Object) => History,
  navigators?: Object,
  extra?: any,
}
```

* **basename** - a prefix that will be prepended to the URL. For example, using a `basename` of `'/playground'`, a route with the path `'/home'` would correspond to the URL path `'/playground/home'`

* **strict** - wether or not a trailing delimiter is allowed when matching path. An url `/foo` will not match a route `FOO: '/foo/'` or an url `/foo/` will not match a route `FOO: '/foo'` when the `strict` option is set to `true`. This is a similar option as the `strict` prop of `<NavLink>` component from `redux-first-router-link` but this option prevents search engines to detect duplicate content (which is bad for SEO) on urls `/foo` and `/foo/`, while the `strict` prop of `<NavLink>` is only meant to determine if the link is active regarding to the current location. Note: search engines may detect duplicate content if somehow a link exists on your site or elsewhere.

* **location** - the name of the state key or a selector function to specify where in your Redux state tree **Redux First Router should** expect your page `location` reducer to be attached to. You can provide a function here which can be useful if you need to implement custom logic to get at the `location` state. This is especially useful for non-standard state shapes, such as Immutable.js. For example, if `state` is an instance of `Immutable.Map` you might have `state => state.get('location')`.

* **title** - the name of the state key or a selector function to specify where in your Redux state tree **Redux First Router should** expect your page `title` reducer to be attached to. This can be omitted if you attach the reducer at `state.title`. **Redux First Router** will change your page title for you when the route changes, e.g. `document.title = 'foo'`. As with `location` you can provide a function here which can be useful if you need to implement custom logic to get at the title state. Example: `state => state.get('title')`.

* **initialDispatch** - `initialDispatch` can be set to `false` to bypass the initial dispatch, so you can do it manually, perhaps after running sagas. An `initialDispatch` function will exist in the object returned by `connectRoutes`. Simply call `initialDispatch()` when you are ready.

* **initialEntries** - an array of entries to initialise history object. Useful for server side rendering and tests.

* **querySerializer** - an object with `parse` and `stringify` methods, such as the `query-string` or `qs` libraries (or anything handmade). This will be used to handle querystrings. Without this option, query strings are ignored silently. See the [query-strings doc](./query-strings.md) for more info.

* **notFoundPath** - the path where users may be redirected in 2 situations: when you dispatch an action with no matching path, or if you manually call `dispatch(redirect({ type: NOT_FOUND }))`, where `NOT_FOUND` is an export from this package. The type in actions and state will be `NOT_FOUND`, which you can use to show a 404 page. Conversely, if the user visits a URL directly or if you dispatch `NOT_FOUND` without the redirect, the ***current URL is preserved*** but the `NOT_FOUND` type is *also* dispatched, which is the correct way websites are typically supposed to deal with URLs they don't handle. *I.e. just like on Github.com, a 404 graphic will show and the URL stays the same.* So you will *rarely see* `'/not-found'` unless you trigger it (intentionally or by accident). Lastly if you specify `notFoundPath: null`, in the aforementioned scenarios, the URL will display as the previous URL (i.e. the URL currently in the address bar) and fallback to `'/'`, such as in SSR if no history exists yet.

* **scrollTop** - wether or not `window.scrollTo(0, 0)` should be run on route changes so the user starts each page at the top. This is a *"poor man's"* scroll restoration, and should be fine while developing, especially if you're using Chrome. Though hash links won't fully function. See the next option for full-on scroll restoration support.

* **restoreScroll** - a function to update window/elements scroll position. See the [scroll restoration doc](./scroll-restoration.md) for more info.

* **onBeforeChange** - a simple function that will be called before the routes change. It's passed your standard `dispatch` and `getState` arguments like a thunk, as well as the `bag` object as a third parameter, which contains the dispatched `action` and the configured `extra` value. Keep in mind unlike `onAfterChange`, the action has not been dispatched yet. Therefore, the state won't reflect it. So you need to use the action to extract URL params from the `payload`. You can use this function to efficiently short-circuit the middleware by calling `dispatch(redirect(newAction))`, where `newAction` has the matching `type` and `payload` of the route you would like to redirect to. Using `onBeforeChange` and `location.kind === 'redirect'` + `res.redirect(301, pathname)` in your `serverRender` function is the idiom here for handling redirects server-side. See [server-rendering docs](./server-rendering.md) for more info.

* **onAfterChange** - a simple function that will be called after the routes change. It's passed your standard `dispatch` and `getState` arguments, as well as the `bag` object as a third parameter, which contains the dispatched `action` and the configured `extra` value.
like a thunk.

* **onBackNext** - a simple function that will be called whenever the user uses the browser *back/next* buttons. It's passed your standard `dispatch` and `getState` arguments like a thunk, as well as the `bag` object as a third parameter, which contains the dispatched `action` and the configured `extra` value. Actions with kinds `back`, `next`, and `pop` trigger this.

* **displayConfirmLeave** - a function receiving `message` and `callback` when navigation is blocked with `confirmLeave`. The message is the return value from `confirmLeave`. The callback can be called with `true` to unblock the navigation, or with `false` to cancel the navigation. See this [blocking navigation](./blocking-navigation.md) for more details

* **createHistory** - a function returning a history object compatible with the popular `history` package. See the below section on "History types" for more details.

* **navigators** - `navigators` is a map of of your Redux state keys to *React Navigation* navigators. Here's how you do it:


```js
import reduxNavigation from 'redux-first-router-navigation'

const options = {
  navigators: reduxNavigation({
    myStack: MyStackNavigator
  })
}
```

> See the [Redux Navigation](./react-native) docs for info on how to use *React Navigation* with this package. We think you're gonna love it :)

* **extra** - an optional value that will be passed as part of the third `bag` argument to all options callbacks and routes `thunk`. It works much like the
[withExtraArgument](https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument) feature of `redux-thunk` or the `context` argument of GraphQL resolvers. You can use it to pass any required context to your thunks without having to tightly couple them to it. For example, you could pass an instance of an API client initialised with authentication cookies, or a function `addReducer` to inject new code split reducers into the store.

## Returned Values

`connectRoutes` returns an `enhancer` and a `middleware` that you will need to use in order to tie everything together.  It should be noted that the order that those values are applied to the store *does matter*. The enhancer must come first in order for the middleware to correctly function.

The returned `reducer` expects its key in the root reducer to be at `location`, unless specified otherwise via the `location` option (outlined above).

```js
import * as reducers from '../reducers/';
import * as otherMiddlewares from '../middlewares';
import { connectRoutes } from 'redux-first-router'
import { combineReducers, createStore, applyMiddleware, compose } from 'redux'

const { reducer, middleware, enhancer } = connectRoutes(history, routesMap)

const rootReducer = combineReducers({ ...reducers, location: reducer })
const middlewares = applyMiddleware([ middleware, ...otherMiddlewares ])
// note that the enhancer comes before other middleware
const store = createStore(rootReducer, compose(enhancer, middlewares))
```

## History types

The `history` object is the return of the *history* package's `createBrowserHistory` or `createMemoryHistory` function:

```js
import createHistory from "rudy-history/createBrowserHistory";

const { middleware, enhancer, reducer } = connectRoutes(routesMap, {
  createHistory,
})

```

*or:*

```js
import createHistory from "rudy-history/createMemoryHistory";
const { middleware, enhancer, reducer } = connectRoutes(routesMap, {
  createHistory,
  initialEntries: [request.path],
})
```

See the widely used [history package](https://github.com/ReactTraining/history) on github. The idea is simply that you can use both interchangeably depending on if you're in the browser or an environment that does not have `window` or `window.history` such as the server, React Native or tests (note: Jest does have a fake functioning `window` object, so in Jest tests, you should use `createMemoryHistory` to keep tests isolated).

When using `createMemoryHistory` the key is to to provide the initial path as the value (within an array) for `initialEntries`. On the server this is easy because you can get it from your `request` object such as when using *express*. In tests, you can set it to whatever you want to trick **Redux First Router** into thinking the app is starting on whatever route you want. In React Native, you get it via the `Linking` API like this:

```js
import { connectRoutes } from 'redux-first-router'
import createHistory from 'history/createMemoryHistory'
import { Linking } from 'react-native'
import config from '../config'

const env = 'development' // should dynamically come from environment variables

const url = await Linking.getInitialURL()
const delimiter = config(env).URI_PREFIX || '://'
const path = url ? `/${url.split(delimiter)[1]}` : '/'

const { middleware, enhancer, reducer } = connectRoutes(routesMap, {
  createHistory,
  initialEntries: [path]
})
```
