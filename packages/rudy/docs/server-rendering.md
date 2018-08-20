# Server Side Rendering (using thunk)

Ok, this is the biggest example here, but given what it does, we think it's
extremely concise and sensible.

Since the middleware handles the actions it receives asyncronously, on the
server you simply `await` the result of a possible matching thunk:

_server/configureStore.js:_

```js
import { createStore, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createMemoryHistory'
import { connectRoutes } from 'redux-first-router'

export async function configureStore(req) {
  const history = createHistory({ initialEntries: [req.path] }) // match initial route to express path

  const routesMap = {
    UNAVAILABLE: '/unavailable',
    ENTITY: {
      path: '/entity/:slug',
      thunk: async (dispatch, getState) => {
        const { slug } = getState().location.payload
        const data = await fetch(`/api/entity/${slug}`)
        const entity = await data.json()
        const action = { type: 'ENTITY_FOUND', payload: { entity } } // you handle this action type

        dispatch(action)
      },
    },
  }

  const { reducer, middleware, enhancer, thunk } = connectRoutes(
    history,
    routesMap,
  ) // notice `thunk`
  const rootReducer = combineReducers({ location: reducer })
  // note the order that the enhancer and middleware are composed in: enhancer first, then middleware
  const store = createStore(
    rootReducer,
    compose(
      enhancer,
      applyMiddleware(middleware),
    ),
  )

  // using redux-thunk perhaps request and dispatch some app-wide state as well, e.g:
  // await Promise.all([ store.dispatch(myThunkA), store.dispatch(myThunkB) ])

  await thunk(store) // THE WORK: if there is a thunk for current route, it will be awaited here

  return store
}
```

_server/serverRender.js:_

```javascript
import configureStore from './configureStore'
import App from './components/App'

export default async function serverRender(req, res) => {
  const store = await configureStore(req)

  const app = ReactDOM.renderToString(<Provider store={store}><App /></Provider>)
  const stateJson = JSON.stringify(store.getState())

  // in a real app, you would use webpack-flush-chunks to pass a prop
  // containing scripts and stylesheets to serve in the final string:
  return res.send(
    `<!doctype html>
      <html>
        <body>
          <div id="root">${appString}</div>
          <script>window.REDUX_STATE = ${stateJson}</script>
          <script src="/static/main.js" />
        </body>
      </html>`
  )
}
```

_server/index.js.js:_

```js
import express from 'express'
import serverRender from './serverRender'

const app = express()
app.get('*', serverRender)
http.createServer(app).listen(3000)
```

_Note: on the server you won't double dispatch your thunks. Unlike the client,
calling the matching thunk is intentionally not automatic so that you can
`await` the promise before sending your HTML to the browser. And of course the
`thunk` returned from `connectRoutes` will automatically match the current route
if called._

## Redirects + `NOT_FOUND` Example

_server/configureStore.js:_

```js
import { createStore, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createMemoryHistory'
import { connectRoutes, redirect, NOT_FOUND } from 'redux-first-router'

export default async function configureStore(req, res) {
  const history = createHistory({ initialEntries: [req.path] })

  const routesMap = {
    UNAVAILABLE: '/unavailable',
    LOGIN: '/login',
    PRIVATE_AREA: {
      path: '/private-area',
      thunk: (dispatch, getState) => {
        const { isLoggedIn } = getState() // up to you to handle via standard redux techniques

        if (!isLoggedIn) {
          const action = redirect({ type: 'LOGIN' }) // action tells middleware to use history.replace()
          dispatch(action) // on the server you detect a redirect as done below
        }
      },
    },
  }

  const { reducer, middleware, enhancer, thunk } = connectRoutes(
    history,
    routesMap,
  )
  const rootReducer = combineReducers({ location: reducer })
  // enhancer first, then middleware
  const store = createStore(
    rootReducer,
    compose(
      enhancer,
      applyMiddleware(middleware),
    ),
  )

  // the idiomatic way to handle redirects
  // serverRender.js will short-circuit since the redirect is made here already
  let location = store.getState().location
  if (doesRedirect(location, res)) return false

  await thunk(store) // dont worry if your thunk doesn't return a promise

  // the idiomatic way to handle routes not found :)
  // your component's should also detect this state and render a 404 scene
  const status = location.type === NOT_FOUND ? 404 : 200
  res.status(status)

  return store
}

const doesRedirect = ({ kind, pathname }, res) => {
  if (kind === 'redirect') {
    res.redirect(302, pathname) // the request completes here, therefore we must short-circuit after
    return true
  }
}
```

_server/serverRender.js:_

```javascript
import configureStore from './configureStore'
import App from './components/App'

export default async function serverRender(req, res) {
  const store = await configureStore(req, res) // pass res now too
  if (!store) return // no store means redirect was already served

  const app = ReactDOM.renderToString(
    <Provider store={store}>
      <App />
    </Provider>,
  )
  const stateJson = JSON.stringify(store.getState())

  return res.send(
    `<!doctype html>
      <html>
        <body>
          <div id="root">${appString}</div>
          <script>window.REDUX_STATE = ${stateJson}</script>
          <script src="/static/main.js" />
        </body>
      </html>`,
  )
}
```

> Note: this example doubles as an example of how to use `redirect` in an SPA
> without SSR. `thunk` usage is the same whether you're doing SSR or not. You
> should be sharing the same `routesMap` between client and server code. You
> likely can share even more. The idiomatic approach is to create a shared
> [`src/configureStore.js`](https://github.com/faceyspacey/redux-first-router-demo/blob/master/server/configureStore.js#L10)
> file that does most of the work. Then in `server/configureStore.js`, handle
> the things that the client is NOT responsible for:

- redirects
- `NOT_FOUND`
- global data-fetching
- `await thunk`.

## Note on Redirects

_Why are redirect actions any different from regular actions?_

To answer that question, imagine instead you _pushed_ a URL on to the address
bar for `/login` when the user tried to access a private area. Now imagine, the
user presses the browser _BACK_ button. The user will now be redirected back to
`login` again and again. The user will struggle to go farther back in the
history stack, which the user very well may want to do if he/she does not want
to login at this time and just wants to get back to where he/she was at.

By using `history.replace()` behind the scenes, the private URL the user tried
to access now becomes the `/login` URL in the stack, and the user can go back to
the previous page just as he/she would expect.

On the server, this is another important anomaly because you don't want to
render the `/login` page under the `/private-area` URL. The idiomatic way to
handle that is the same as `NOT_FOUND` and therefore succinct and consistent.

## Notes on `NOT_FOUND`

`NOT_FOUND` is no different than any action you can dispatch yourself. The only
difference is that _RFR_ also knows to dispatch it. It will be dispatched when
no routes match the URL or if you dispatch an action that doesn't match a route
path. Therefore it should be your catch-all action type to display a pretty page
that shows the resource is missing.
