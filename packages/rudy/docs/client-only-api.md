# Client-Only API

The following are features you should avoid unless you have a reason that makes
sense to use them. These features revolve around the
[history package's](npmjs.com/package/history) API. They make the most sense in
React Native--for things like back button handling. If you're using our _React
Navigation_ tools, you also won't want to use this as `StackRouter` doesn't jive
with a plain sequence of history entries. On web, you'll rarely need it as
you'll want to use our
[Link component](https://github.com/faceyspacey/redux-first-router-link) to
create real links embedded in the page for SEO/SSR instead.

One case for web though--if you're curious--is the fake address bar you've
probably seen in one our examples. If you have such needs, go for it.

_Takeaway:_ On web, force yourself to use our `<Link />` package so that real
`<a>` tags get embedded in the page for SEO and link-sharing benefits; beware of
using the below methods.

## Imperative Methods

- **push:** (path) => void
- **replace:** (path) => void
- **back:** () => void
- **next:** () => void
- **go:** (number) => void
- **canGoBack:** (path) => boolean
- **canGoForward:** () => boolean
- **prevPath:** () => ?string
- **nextPath:** () => ?string

**You can import them like so:**

```javascript
import { back, canGoBack } from 'redux-first-router'
```

> For a complete example, see the
> [React Native Android BackHandler Example](./react-native.md#android-backhandler).

Keep in mind these methods should not be called until you call `connectRoutes`.
This is almost always fine, as your store configuration typically happens before
your app even renders once.

_Note: do NOT rely on these methods on the server, as they do not make use of
enclosed_ **_per request_** _state. If you must, use the corresponding methods
on the `history` object you create per request which you pass to
`connectRoutes(history`). Some of our methods are convenience methods for what
you can do with `history`, so don't expect `history` to have all the above
methods, but you can achieve the same. See the
[history package's docs](https://github.com/ReactTraining/history) for more
info._
