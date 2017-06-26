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

The only parameter `connectRoutes` expects is the `history` object. You won't get much for that, but it won't break your redux store.
The second parameter is your all-important `routesMap`. And the third is a small set of `options` in a map that you can provide.

Let's dive into each.

## History
The `history` object is the return of the *history* package's `createBrowserHistory` or `createMemoryHistory` function:

```
import createHistory from 'history/createBrowserHistory'
const history = createHistory() // notice no parameters are needed in the browser
const { middleware, enhancer, reducer } = connectRoutes(history)

```
*or:*
```
import createHistory from 'history/createMemoryHistory'
const history = createHistory({ initialEntries: [request.path] })
const { middleware, enhancer, reducer } = connectRoutes(history)
```

See the widely used [history package](https://github.com/ReactTraining/history) on github. The idea is simply that you can use
both interchangeably depending on if you're in the browser or an environment that does not have `window` or `window.history` such as the 
server, React Native or tests (note: Jest does have a fake functioning `window` object, so in Jest tests, you should
use `createMemoryHistory` to keep tests isolated).

When using `createMemoryHistory` the key is to to provide the initial path as the value (within an array) for `initialEntries`. On the
server this is easy because you can get it from your `request` object such as when using *express*. In tests, you can set it to whatever
you want to trick **Redux First Router** into thinking the app is starting on whatever route you want. In React Native, you get it via
the `Linking` API like this:

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


## RoutesMap

The `routesMap` was pretty much covered in the [readme](../README.md), but to be thorough,
we'll explain it in depth, as well as describe the missing details about the `toPath` and `fromPath` functions. Here's its 
*Flow type*:

```javascript
type RoutesMap = {
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

*note: one very important thing to note about the resulting dispatched actions is that the payload is expected to always be an object.
When using* **Redux First Router**, *do not dispatch payloads that are primitives such as `number` or `string`.*

Features:
* **route as a string** is simply a path to match to an action type without any transformations
* **capitalizedWords** when true will break apart hyphenated paths into words, each with the first character capitalizedWords
* **toPath** will one-by-one take the keys and values of your payload object and transform them into path segments. So for a payload 
with multiple key/value pairs, it will call `toPath` multiple times, passing in the individual value as the first argument
and the individual key name as the second argument.
* **fromPath** will do the inverse, taking each dynamic path *:segment* and its name (in this case "segment") and pass it to 
`fromPath` multiple times. The first argument is the segment and the second its name as delinated in your `routesMap` object
after colons.
* **thunk** is a function just like what you dispatch when using the `redux-thunk` middleware, taking `dispatch` and `getState`
arguments. NOTE: you do NOT need `redux-thunk` for this to work. On the client, the thunk will be called any time the middleware
detects a matching route. However to properly manage server-side rendering, there are 2 optimizations: 1) on first load on the client *if
server side rendering is detected*, it will not be called because it will be assumed to have been handled on the server and the 
`initialState` on the client hydrated from that. 2) on the server, on first load, it also WILL NOT be called because it is expected
to be handled manually in order to allow you to syncronously `await` its result before sending your HTML to the client. See the
[server side rendering](./docs/server-rendering.md) doc for the idiomatic way to do this.


## Options
Lastly, let's talk about the `options` you can provide. There are 6. Here's its flow type:

```javascript
type Options = {
  location?: string, // default: 'location'
  title?: string,    // default: 'title'
  scrollTop?: boolean,
  restoreScroll?: ((PrevLocationState, LocationState) => boolean | string | array) => ScrollBehavior,
  onBeforeChange?: (Dispatch, GetState) => void,
  onAfterChange?: (Dispatch, GetState) => void,
  onBackNext?: (Dispatch, GetState, HistoryLocation, Action) => void
}
```

* **location** - the `location` lets you specify what key **Redux First Router** should expect its reducer to be attached to in your Redux state tree. 

* **title** - the `title` is similarly the name of the state key for your page title. **Redux First Router** will change your page 
title for you when the route changes, e.g. `document.title = 'foo'`.

* **notFoundPath** - the `notFoundPath` will be set as the `pathname` in actions when the path corresponding to an action cannot be determined. It's worth noting that if path was pushed from the Address Bar, but there was no matching route, we preserve that path and leave it up to you to decide what to do with it (similar to how you can land on incorrect Github pages where nothing exists, but where the URL stays the same). There are a few other cases where we may know the path for sure, but can't successfull fulfill the request. The path is preserved *(and `notFoundPath` is NOT used)* when we can.

* **scrollTop** - the `scrollTop` option calls `window.scrollTo(0, 0)` on route changes so the user starts each page at the top. This is a *"poor man's"* scroll
restoration, and should be fine while developing, especially if you're using Chrome. Though hash links won't fully function. See the next option for full-on scroll restoration support.

* **restoreScroll** - the `restoreScroll` is a call to `redux-first-router-restore-scroll`'s restoreScroll` function, with a `shouldUpdateScroll` callback passed a single argument. See the [scroll restoration doc](./scroll-restoration.md) for more info. 

* **onBeforeChange** - `onBeforeChange` is a simple function that will be called before the routes change. It's passed your standard `dispatch` and `getState` arguments
like a thunk.

* **onAfterChange** - `onAfterChange` is a simple function that will be called after the routes change. It's passed your standard `dispatch` and `getState` arguments
like a thunk.

* **onBackNext** - `onBackNext` is a simple function that will be called whenever the user uses the browser *back/next* buttons. It's passed your standard `dispatch` and `getState` arguments like a thunk. Actions with kinds `back`, `next`, and `pop` trigger this.

* **navigators** - `navigators` is a map of of your Redux state keys to *React Navigation* navigators. Here's how you do it:


```js
import reduxNavigation from 'redux-first-router-navigation'

const options = {
  navigators: reduxNavigation({
    myStack: MyStackNavigator
  })
}
```

> See the [Redux Navigation](./redux-navigation) docs for info on how to use *React Navigation* with this package. We think you're gonna love it :)
