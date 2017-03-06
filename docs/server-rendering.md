# Server Side Rendering (using thunk)
Ok, this is the biggest example here, but given what it does, we think it's extremely concise and sensible. Since the middleware handles the actions it receives asyncronously, on the server you simply await the result of a possible matching thunk:
```javascript
import express from 'express'
import createHistory from 'history/createMemoryHistory'
import { connectRoutes, NOT_FOUND } from 'pure-redux-router'

const render = async (req, res) => {
   const history = createHistory({
    initialEntries: [req.path], // match initial route to express path
  })

  const routesMap = {
    UNAVAILABLE: '/unavailable',
    ENTITY: { 
      path: '/entity/:slug',
      thunk: async (dispatch, getState) => {
        const { slug } = getState().location.payload
        const entity = await fetch(`/api/entity/${slug}`)
        const action = { type: 'ENTITY_FOUND', payload: { entity } }
        
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
  
  // the idiomatic way to handle routes not found :)
  if (store.getState().location.type === NOT_FOUND) {
    return res.redirect(302, '/unavailable') 
  }

  const state = JSON.stringify(store.getState())
  
  const html = ReactDOM.renderToString(<Provider store={store}><App state={state} /></Provider>)
  res.status(200).send(`<!DOCTYPE html>${html}`)
}

const app = express()
app.get('*', render)
http.createServer(app).listen(3000)
```
*Note: on the server you won't double dispatch your thunks. Unlike the client, calling the matching thunk is intentionally not automatic so that you can `await` the promise before sending your HTML to the browser. And of course the `thunk` returned from `connectRoutes` will automatically match the current route if called.*


## Redirects Example

```javascript
import express from 'express'
import createHistory from 'history/createMemoryHistory'
import { connectRoutes, NOT_FOUND, redirect } from 'pure-redux-router'

const render = async (req, res) => {
   const history = createHistory({
    initialEntries: [req.path], // match initial route to express path
  })

  const routesMap = {
    UNAVAILABLE: '/unavailable',
    LOGIN: '/login',
    MY_ACCOUNT: {
      path: '/my-account',
      thunk: (dispatch, getState) => {
        const { isLoggedIn } = getState()           // up to you to handle via standard redux techniques

        if (!isLoggedIn) {
          const action = redirect({ type: 'LOGIN' })// action tells middleware to use history.replace()
          dispatch(action)                          // on the server you detect a redirect as done below
        }
      }
    },
  }

  const { reducer, middleware, enhancer, thunk } = connectRoutes(history, routesMap) 
  const rootReducer = combineReducers({ location: reducer })
  const store = createStore(rootReducer, compose(enhancer, applyMiddleware(middleware)))

  await thunk(store) // dont worry if your thunk doesn't return a promise
  
  // the idiomatic way to handle routes not found + redirects :)
  const { type, redirect } = store.getState().location
  
  if (type === NOT_FOUND) {
    return res.redirect(302, '/unavailable') 
  }
  else if (redirect) {
    return res.redirect(302, redirect) // redirect === '/login' in this case
  }

  const state = JSON.stringify(store.getState())
  
  const html = ReactDOM.renderToString(<Provider store={store}><App state={state} /></Provider>)
  res.status(200).send(`<!DOCTYPE html>${html}`)
}
```

## Note on Redirects
*Whay are dispatched redirect actions are any different from regular actions?* 

To answer that question, imagine instead
you *pushed* a URL on to the address bar for `/login` when the user tried to access a private area. Now imagine, the user
presses the browser *BACK* button. The user will now be redirected back to `login` again and again. The user will struggle to go farther
back in the history stack, which the user very well may want to do if he does not want to login at this time and 
just wants to get back to where he was at. 

By using `history.replace()` behind the scenes, the private URL the user tried
to access now becomes the `/login` URL in the stack, and the user can go back to the previous page just as he/she would expect.

On the server, this is another important anomaly because you don't want to render the `/login` page under the `/private-area` URL.
The idiomatic way to handle that is the same as `NOT_FOUND` and therefore succinct and consistent. 
