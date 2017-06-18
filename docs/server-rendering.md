# Server Side Rendering (using thunk)
Ok, this is the biggest example here, but given what it does, we think it's extremely concise and sensible. Since the middleware handles the actions it receives asyncronously, on the server you simply `await` the result of a possible matching thunk:

*configureStore.js:*
```js
import { createStore, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createMemoryHistory'
import { connectRoutes } from 'redux-first-router'

export function async configureStore(path) {
  const history = createHistory({
    initialEntries: [path] // match initial route to express path
  })

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
      }  
    },
  }

  const { reducer, middleware, enhancer, thunk } = connectRoutes(history, routesMap) // notice `thunk`
  const rootReducer = combineReducers({ location: reducer })
  const store = createStore(rootReducer, compose(enhancer, applyMiddleware(middleware)))

  // using redux-thunk perhaps request and dispatch some app-wide state as well, e.g:
  // await Promise.all([ store.dispatch(myThunkA), store.dispatch(myThunkB) ])
  
  await thunk(store) // THE WORK: if there is a thunk for current route, it will be awaited here

  return store
}
```

*serverRender.js:*
```javascript
import serialize from 'serialize-javascript'
import { NOT_FOUND } from 'redux-first-router'
import configureStore from './configureStore'
import App from './components/App'
import Html from './components/Html'

export default async function serverRender(req, res) => {
  const store = await configureStore(req.path)
  let status = 200

  // the idiomatic way to handle routes not found :)
  // your component's should also detect this state and render a 404 scene
  if (store.getState().location.type === NOT_FOUND) {
    status = 404
  }

  const app = ReactDOM.renderToString(<Provider store={store}><App /></Provider>)
  const state = serialize(store.getState())

  // in a real app, you would use webpack-flush-chunks to pass a prop
  // containing scripts and stylesheets to serve in the final string:
  const html = ReactDOM.renderToStaticMarkup(<Html app={app} state={state} />)
  
  res.status(status).send(`<!DOCTYPE html>${html}`)
}
```

*server.js:*
```js
import express from 'express'
import serverRender from './serverRender'

const app = express()
app.get('*', serverRender)
http.createServer(app).listen(3000)
```

*Note: on the server you won't double dispatch your thunks. Unlike the client, calling the matching thunk is intentionally not automatic so that you can `await` the promise before sending your HTML to the browser. And of course the `thunk` returned from `connectRoutes` will automatically match the current route if called.*


## Redirects Example
> Note: usage of `redirect` within the thunk is how to do redirects even without SSR.

*configureStore:*
```js
import { createStore, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createMemoryHistory'
import { connectRoutes } from 'redux-first-router'

export default async function configureStore(path) {
  const history = createHistory({
    initialEntries: [req.path]
  })

  const routesMap = {
    UNAVAILABLE: '/unavailable',
    LOGIN: '/login',
    PRIVATE_AREA: {
      path: '/private-area',
      thunk: (dispatch, getState) => {
        const { isLoggedIn } = getState()           // up to you to handle via standard redux techniques

        if (!isLoggedIn) {
          const action = redirect({ type: 'LOGIN' })// action tells middleware to use history.replace()
          dispatch(action)                          // on the server you detect a redirect as done below
        }
      }
    }
  }

  const { reducer, middleware, enhancer, thunk } = connectRoutes(history, routesMap) 
  const rootReducer = combineReducers({ location: reducer })
  const store = createStore(rootReducer, compose(enhancer, applyMiddleware(middleware)))

  await thunk(store) // dont worry if your thunk doesn't return a promise

  return store
}
```

*serverRender.js:*
```javascript
import serialize from 'serialize-javascript'
import { NOT_FOUND, redirect } from 'redux-first-router'
import configureStore from './configureStore'
import App from './components/App'
import Html from './components/Html'

export default async function serverRender(req, res) {
  const store = await configureStore(req.path)
  let status = 200

  // the idiomatic way to handle routes not found + redirects :)
  const { type, kind, pathname } = store.getState().location
  
  if (type === NOT_FOUND) {
    status = 404
  }
  else if (kind === 'redirect') {
    return res.redirect(302, pathname) // pathname === '/login' in this case
  }

  
  const app = ReactDOM.renderToString(<Provider store={store}><App /></Provider>)
  const state = serialize(store.getState())
  const html = ReactDOM.renderToStaticMarkup(<Html app={app} state={state} />)
  
  res.status(status).send(`<!DOCTYPE html>${html}`)
}
```

## Note on Redirects
*Whay are dispatched redirect actions any different from regular actions?* 

To answer that question, imagine instead
you *pushed* a URL on to the address bar for `/login` when the user tried to access a private area. Now imagine, the user
presses the browser *BACK* button. The user will now be redirected back to `login` again and again. The user will struggle to go farther
back in the history stack, which the user very well may want to do if he/she does not want to login at this time and 
just wants to get back to where he/she was at. 

By using `history.replace()` behind the scenes, the private URL the user tried
to access now becomes the `/login` URL in the stack, and the user can go back to the previous page just as he/she would expect.

On the server, this is another important anomaly because you don't want to render the `/login` page under the `/private-area` URL.
The idiomatic way to handle that is the same as `NOT_FOUND` and therefore succinct and consistent. 
