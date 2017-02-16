# pure-redux-router

think of your app in states not routes (and, yes, while keeping the address bar in sync)

And here's all you need! :+1:
```javascript
import { createStore, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createBrowserHistory'

const history = createHistory()

// THE WORK:
const routesMap = { 
  HOME: '/home',
  USER: '/user/:id',
}

const { reducer, middleware, enhancer } = connectTypes(history, routesMap)

// and you already know how the story ends:

const rootReducer = combineReducers({ location: reducer })
const middlewares = applyMiddleware(middleware)
const store = createStore(rootReducer, compose(enhancer, middlewares))
```
*pay attention to `routesMap`*


## routesMap

Match action types to express style dynamic paths, with a few frills.
```javascript

const routesMap = {
  HOME: '/home',
  CATEGORY: { path: '/category/:cat', capitalizedWords: true },
  USER: { 
    path: '/user/:cat/:name',
    fromPath: path => path.toUpperCase().replace(/-/g, ' '),
    toPath: value => value.toLowerCase().replace(/ /g, '-'),
  },
}

/** URL                     <->   ACTION 
 *  /home                   <->   { type: 'HOME' }
 *  /category/java-script   <->   { type: 'CATEGORY', payload: { cat: 'Java Script' } }
 *  /user/elm/bill-gates    <->   { type: 'USER', payload: { cat: 'ELM', name: 'BILL GATES' } }
 */
```
*note: the signature of `fromPath` and `toPath` offers a little more, e.g: `(pathSegment, key) => value`. Visit [routesMap docs](http://github.com/faceyspacey/pure-redux-router/docs/routesMap) for a bit more info when the time comes.*


## routesMap (with thunk)
After the dispatch of a matching action, a thunk (if provided) will be called, allowing you to extract path parameters from the location reducer state and make asyncronous requests to get needed data:
```javascript

const userThunk = async (dispatch, getState) => {
  const { slug } = getState().location.payload
  const user = await fetch(`/api/user/${slug}`)
  const action = { type: 'USER_FOUND', payload: { user } }
  
  dispatch(action)
}

const routesMap = {
  USER: { path: '/user/:slug', thunk: userThunk  },
}

/** URL                <->   ACTION 
 *  /user/steve-jobs   <->   { type: 'USER', payload: { slug: 'steve-jobs' } }
 */
```
*Visit [locationReducer docs](http://github.com/faceyspacey/pure-redux-router/docs/locationReducer) to see what state is contained in the location reducer.*


## Server Side Rendering (using thunk)
Ok, this is the biggest example here, but given what it does, it's extremely concise and sensible. Since the middleware handles the actions it receives asyncronously, on the server you simply await the result of a possible matching thunk:
```javascript
import express from 'express'
import createHistory from 'history/createMemoryHistory'
import userActionCreator from '../actions/user'

const render = (req, res) => {
   const history = createHistory({
    initialEntries: [req.path], // match initial route to express path
  })

  const routesMap = {
    USER: { path: '/user/:slug', thunk: userActionCreator() }, // returns thunk from prev example
  }

  const { reducer, middleware, enhancer, thunk } = connectTypes(history, routesMap)
  const rootReducer = combineReducers({ location: reducer })
  const store = createStore(rootReducer, compose(enhancer, applyMiddleware(middleware)))

  // perhaps request and dispatch some app-wide state as well, e.g:
  // await Promise.all([ store.dispatch(myThunkA), store.dispatch(myThunkB) ])
  
  await thunk(store) // THE WORK: if there is a thunk for current route, it will be awaited here
  
  const state = JSON.stringify(store.getState())
  
  const html = ReactDOM.renderToString(<Provider store={store}><App state={state} /></Provider>)
  res.status(200).send(`<!DOCTYPE html>${html}`)
}

const app = express()
app.get('*', render)
http.createServer(app).listen(3000)
```
*Note: and yes, on the server you won't double dispatch your thunks. Unlike the client, calling the matching thunk is intentionally not automatic so that you can `await` the promise before sending your HTML to the browser. And of course the `thunk` returned from `connectTypes` will automatically match the current route if called.*
