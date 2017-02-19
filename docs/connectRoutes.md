# connectRoutes

`connectRoutes` is the primary "work" you will do to get **Pure Redux Router** going. It's all about creating and maintaining
a pairing of *action types* and dynamic express style route paths. If you use our `<Link />` component and pass an *action* as
its `href` prop, you can change the URLs you use here any time without having to change your application code. 

In general, once you set this up, the only "work" you should expect to do in your component code is diligent use of the `<Link />` component
to specify what actions/URLs will be dispatched, and perhaps more importantly what markup will be written to the page. You can get the same
effect of the address bar changing just by dispatching actions bound as event handlers like you usually do, but that doesn't get you
`<a>` tags embedded in the page for search engines to pick up. 

To get the benefits of SEO, the changes to your workflow are minor. It's an inversion of control where you now specify actions in your components
rather than `mapDispatchToProps` handlers. Once you get used to it, it will take very little discpline to make this your new way of operating.

Lastly, it's not that you can't still use `mapDispatchToProps`--you just won't want to
in order to get SEO benefits for actions that you want to change the address bar (and allow the user to *back/next` through using the 
browser buttons). To learn more about how to create links, check out our [<Link /> component](https://github.com/faceyspacey/pure-redux-router-link).

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

See the widely used [history](https://github.com/ReactTraining/history) on github. The idea is simply that you can use
both interchangeably depending on if you're in the browser or an environment that does not have `window` or `window.history` such as the 
server, React Native or tests (note: Jest does have a fake functioning `window` object, so in Jest tests, you should
use `createMemoryHistory` to keep tests isolated).

When using `createMemoryHistory` the key is to to provide the initial path as the value (within an array) for `initialEntries`. On the
server this is easy because you can get it from your `request` object such as when using *express*. In tests, you can set it to whatever
you want to trick **Pure Redux Router** into thinking the app is starting on whatever route you want. In React Native, you get it via
the `Linking` API like this:

```javascript
import { Linking } from 'react-native'
const path = await Linking.getInitialURL()
const history = createHistory({ initialEntries: [path] })
const { middleware, enhancer, reducer } = connectRoutes(history)
```


## RoutesMap

The `routesMap` was pretty much covered in the [readme](https://github.com/faceyspacey/pure-redux-router), but to be thorough,
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

Features:
* **route as a string** is simply path to match to an action type without any transformations
* **capitalizedWords** when true will break apart hyphenated paths into words, each with the first character capitalizedWords
* **toPath** will one-by-one take the keys and values of your payload object and transform them into path segments. So for a payload 
with multiple key/value pairs, it will call `toPath` multiple times, passing it the the individual value as the first argument
and the individual key name as the second argument.
* **fromPath** will do the reverse, taking each dynamic path *:segment* and its name (in this case "segment") and pass it to 
`fromPath` multiple times. The first argument is the segment and the second its name as delinated in your `routesMap` object
after colons.
* **thunk** is a function just like what you dispatch when using the `redux-thunk` middleware, taking `dispatch` and `getState`
arguments. NOTE: you do NOT need `redux-thunk` for this to work. On the client, the thunk will be called any time the middleware
detects a matching route. However to properly manage server side rendering, there are 2 caveats: 1) on first load on the client if
server side rendering is detected, it will not be called because it will be assumed to have been handled on the server and the 
`initialState` on the client hydrated from that. 2) on the server, on first load, it also WILL NOT be called because it is expected
to be handled manually in order to allow you to syncronously `await` its result before sending your HTML to the client. See the
[server side rendering](https://github.com/faceyspacey/pure-redux-router/blob/master/docs/server-rendering.md) docs.


## Options
Lastly, let's talk about the `options` you can provide. There are 3. Here's its flow type:

```javascript
type Options = {
  location?: string, // default: 'location'
  title?: string,    // default: 'title'
  onBackNext?: (HistoryLocation, Action) => void,
}
```

The `location` lets you specify what key **Pure Redux Router** should expect its reducer to be attached to in your Redux state stree. The `title`
is similarly the name of the state key for your page title. If it's provided, **Pure Redux Router** will change your page 
title for you, e.g. `document.title = 'foo'`. We'll change your page title even if action types not in your `routesMap` are dispatched.
Use it however you want, knowing that when its value changes, so will your page title.

`onBackNext` is a simple function that will be called whenever the user uses the browser *back/next* buttons. It's passed 2 arguments:
the `action` dispatched as a result of the URL changing and the value of `history.location`. It's one of the few frills this package
offers. *Fun Fact: we originally added it because we wanted to play a click a sound when the user presses those buttons, similar to
the experience when the user pressed buttons on the page.* Perhaps you will find it useful too. 
