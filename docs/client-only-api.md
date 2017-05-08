# Client-Only API
The following are features you should avoid unless you have a reason that makes sense to use them. These features revolve around the [history package's](npmjs.com/package/history) API. They make the most sense in React Native--for things like back button handling. On web, you'll rarely need it as you'll want to use our [<Link /> component](https://github.com/faceyspacey/redux-first-router-link) to create real links embedded in the page for SEO/SSR instead. 

One case for web though--if you're curious--is the fake address bar you've probably seen in one our examples. If you have such needs, go for it.

*Takeaway:* On web, force yourself to use our `<Link />` package so that real `<a>` tags get embedded in the page for SEO and link-sharing benefits; beware of using the below methods.



## Imperative Methods

* **push:** (path) => void
* **replace:** (path) => void
* **back:** () => void
* **next:** () => void
* **go:** (number) => void
* **canGoBack:** (path) => boolean
* **canGoForward:** () => boolean
* **prevPath:** () => ?string
* **nextPath:** () => ?string

**You can import them like so:**

```javascript
import { back, canGoBack } from 'redux-first-router'
```
> For a complete example, see the [React Native Android BackHandler Example](./react-native.md#android-backhandler).

Keep in mind these methods should not be called until you call `connectRoutes`. This is almost always fine, as your store configuration typically happens before your app even renders once. 

*Note: do NOT rely on these methods on the server, as they do not make use of enclosed* ***per request*** *state. If you must, use the corresponding
methods on the `history` object you create per request which you pass to `connectRoutes(history`). Some of our methods are convenience methods for what you can do with `history`, so don't expect `history` to have all the above methods, but you can achieve the same. See the [history package's docs](https://github.com/ReactTraining/history)
for more info.*



## Declarative History API

The `location` state and the `action.meta.location` object *on the server or in environments where you used `createMemoryHistory`
to create your history (such as React Native)* will also maintain the ***declarative*** information about the history stack. It can be found within the `history` key, and this 
is its shape:

```javascript
history: {
  index: number,          // index of focused entry/path
  length: number,         // total # of entries/paths
  entries: Array<string>, // array of paths obviously
}
```

This is different from what the `history` package maintains in that you can use Redux to reactively respond to its changes. Here's an example:

```js
import React from 'react'
import { connect } from 'react-redux'

const MyComponent = ({ isLast, path }) =>
  isLast ? <div>last</div> : <div>{path}</div>

const mapStateToProps = ({ location: { history } }) => ({
  isLast: history.index === history.length - 1,
  path: history.entries[history.index].pathname
})

expoort default connect(mapStateToProps)(MyComponent)
```
> By the way, this example also showcases the ultimate goal of **Redux First Router:** *to stay within the "intuitive" workflow of standard Redux patterns*.


If you're wondering why such state is limited to `createMemoryHistory`, it's because it can't be consistently maintained in the browser. Here's why:

[would it be possible for createBrowserHistory to also have entries and index? #441](https://github.com/ReactTraining/history/issues/441)

In short, the browser will maintain the history for your website even if you refresh the page, whereas from our app's perspective,
if that happens, we'll lose awareness of the history stack. `sessionStorage` almost can solve the issue, but because of various
browser inconsitencies (e.g. when cookies are blocked, you can't recall `sessionStorage`), it becomes unreliable and therefore
not worth it. 


***When might I have use for it though?***

Well, you see the fake browser we made in our playground on *webpackbin*, right? We emulate the browser's back/next buttons
using it. If you have the need to make such a demo or something similar, totally use it--we plan to maintain the secret API.

*Redux First Router's* [React Navigation implementation](./react-native#react-navigation) also relies heavily on `history` state.






