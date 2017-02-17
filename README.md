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

const { reducer, middleware, enhancer } = connectRoutes(history, routesMap)

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
