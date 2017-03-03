# Server Side Rendering (using thunk)
Ok, this is the biggest example here, but given what it does, we think it's extremely concise and sensible. Since the middleware handles the actions it receives asyncronously, on the server you simply await the result of a possible matching thunk:
```javascript
import express from 'express'
import createHistory from 'history/createMemoryHistory'
import { connectRoutes, NOT_FOUND } from 'pure-redux-router'
import userActionCreator from '../actions/user'

const render = async (req, res) => {
   const history = createHistory({
    initialEntries: [req.path], // match initial route to express path
  })

  const routesMap = {
    USER: { path: '/user/:slug', thunk: userActionCreator() }, // returns thunk from readme example
  }

  const { reducer, middleware, enhancer, thunk } = connectRoutes(history, routesMap) // notice `thunk`
  const rootReducer = combineReducers({ location: reducer })
  const store = createStore(rootReducer, compose(enhancer, applyMiddleware(middleware)))

  // perhaps request and dispatch some app-wide state as well, e.g:
  // await Promise.all([ store.dispatch(myThunkA), store.dispatch(myThunkB) ]) // uses thunk middleware
  
  await thunk(store) // THE WORK: if there is a thunk for current route, it will be awaited here
  
  // the idiomatic way to handle routes not found :)
  if (store.getState().location.type === NOT_FOUND) {
    return res.redirect(302, '/') // no 404 page needed yet
  }

  const state = JSON.stringify(store.getState())
  
  const html = ReactDOM.renderToString(<Provider store={store}><App state={state} /></Provider>)
  res.status(200).send(`<!DOCTYPE html>${html}`)
}

const app = express()
app.get('*', render)
http.createServer(app).listen(3000)
```
*Note: and yes, on the server you won't double dispatch your thunks. Unlike the client, calling the matching thunk is intentionally not automatic so that you can `await` the promise before sending your HTML to the browser. And of course the `thunk` returned from `connectRoutes` will automatically match the current route if called.*
