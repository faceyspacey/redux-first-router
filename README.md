# pure-redux-router

At face value, the goal of **Pure Redux Router** is to think of your app in *states*--which, thanks to tools like Redux and React itself,
so many of us have found effective--NOT *routes*; and of course while keeping the address bar in sync.

The thinking behind this package has been: "if we were to dream up a 'Redux-first' approach to routing from the 
ground up, what would it look like?" The result has been what we hope you feel to be one of those 
"inversion of control" scenarios that makes a challenging problem *simple* when coming at it from a different angle.

The desired effect it will have on you will be: "Wow, this is an obvious and simple solution to a long standing problem. 
I'm not sure why this hasn't been done yet. This is the correct way to do this. Forget 'React Router' if your app is Redux-heavy."

That said and before we get started, there is some *prior art*, and you should [check them out](../docs/prior-art). **Pure Redux Router**
isn't the first stab at something like this, but we feel it is the most complete, tested and *spot on* solution. We have reviewed
what came before, stripped what was unnecessary, added what was needed, and generally focused on getting the core right. Let's get started.

## Installation

Install `pure-redux-router` and its peer dependency `history`:

```bash
yarn install pure-redux-router history
```

## Motivation

To be able to use Redux *as is* while keeping the URL in the address bar in sync. To automate routing. 
To think solely in terms of *"state"* and NOT routes, paths, route matching components, etc.

That means having the address bar update in response to actions and ***bi-directionally*** 
having actions dispatched in response to address bar changes, such as via the browser
back/forward buttons.

In addition, here are some key obstacles **Pure Redux Router** seeks to *avoid*:

* cluttering component code with route-oriented components
* the added complexity of 2 forms of state: redux state vs. routing state
* large API surface areas  of packages/frameworks
like `react-router` and `next.js`
* workarounds that such large abstractions inevitably require to achieve a professional app
* as low level as possible tools to deal with animations. Animations coinciding with React 
component updates *are* a problem, particularly in the browser (React Native is better). 
"Jank" is common. Techniques  like `shouldComponentUpdate` are a must; routing frameworks 
get in the way of optimizing animations.


## Usage
It's pretty much *set-and-forget-it*, so here's the most work you'll ever do! :+1:

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
