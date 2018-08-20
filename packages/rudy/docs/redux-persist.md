## Usage with redux-persist

⚠️ WARNING: redux-persist is undergoing
[a big refactor](https://github.com/rt2zz/redux-persist/tree/v5) at the moment.
This doc is based on the currently
[stable v4.6.0](https://github.com/rt2zz/redux-persist/releases/tag/v4.6.0). v5
might or might nor break this approach ⚠️

#### Using the Cookies storage adapter

You might run into a situation where you want to trigger a redirect as soon as
possible in case some particular piece of state is or is not set. A possible use
case could be persisting checkout state, e.g. `checkoutSteps.step1Completed`.

To do this, the only method I'm aware of is using good old Cookies so we already
have the state available during the server rendering cycle.

```js
// routesMap.js
// ...

const canContinueIf = (stepCompleted, dispatch, fallbackRoute) => {
  if (!stepCompleted) {
    const action = redirect({ type: fallbackRoute })
    dispatch(action)
  }

// ...

export default {
  // ...
  CHECKOUT_STEP_2: {
    path: '/checkout-step-2',
    thunk: (dispatch, getState) => {
      const { checkoutSteps } = getState()
      canContinueIf(checkoutSteps.step1Completed, dispatch, 'CHECKOUT_STEP_1')
    }
  }
  // ...
}
```

```js
// server/configureStore.js
//...

const parseCookies = (cookies) => {
  const parsedCookies = {}
  Object.entries(cookies).forEach(([key, value]) => {
    const decodedKey = decodeURIComponent(key)
    const keyWithoutReduxPersistPrefix = decodedKey.replace(/reduxPersist:/, '')
    if (key !== 'reduxPersistIndex') {
      // TODO: This could be expanded into a real black- or whitelist
      parsedCookies[keyWithoutReduxPersistPrefix] = JSON.parse(value)
    }
  })
  return parsedCookies
}

//...

export default async (req, res) => {
  // ...
  const parsedCookies = parseCookies(req.cookies)
  const preLoadedState = { ...parsedCookies } // onBeforeChange will authenticate using this
  // ...
}
```

```js
// src/configureStore.js
//...

export default (history, preLoadedState) => {
  // …
  const store = createStore(rootReducer, preLoadedState, enhancers)

  if (!isServer) {
    persistStore(store, {
      blacklist: ['location', 'page'],
      storage: new CookieStorage(),
    })
  }
  // …
}
```

```js
// server/index.js
import cookieParser from 'cookie-parser'

// ...

app.use(cookieParser())

// ...
```
