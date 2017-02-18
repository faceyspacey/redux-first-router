# Brief

![pure-redux-router flow chart](https://raw.githubusercontent.com/faceyspacey/pure-redux-router/master/docs/pure-redux-router-flow.png)

At face value, the goal of **Pure Redux Router** is to think of your app in *states*--which, thanks to tools like Redux and React itself,
so many of us have found effective--NOT *routes*; and of course while keeping the address bar in sync.

The thinking behind this package has been: "if we were to dream up a 'Redux-first' approach to routing from the 
ground up, what would it look like?" The result has been what we hope you feel to be one of those 
"inversion of control" scenarios that makes a challenging problem *simple* when coming at it from a different angle.

The desired effect to have on you is: 
> "Wow, this is an obvious and simple solution to a long standing problem. 
I'm not sure why this hasn't been done yet. This is the correct way to do this. Forget 'React Router' if your app 
is Redux-heavy. Redux states always had all we need to render our app."

That said and before we get started, there is some *prior art*, and you should [check them out](../docs/prior-art). **Pure Redux Router**
isn't the first stab at something like this, but--aside this path being pre-validated--we feel it is the most complete, tested and *spot on* solution. 
We have reviewed what came before, stripped what was unnecessary, added what was needed, and generally focused on getting the core right. The best
part is that once you set it up there's virtually nothing left to do. It's truly "set it and forget it." Let's get started.

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
back/forward buttons. The "bi-directional" aspect is embodied in diagram above where the first arrow
points both ways--dispatching actions changes the address bar, and changes to
the address bar dispatches actions.

In addition, here are some key obstacles **Pure Redux Router** seeks to *avoid*:

* having to render from any state that doesn't come from redux
* cluttering component code with route-oriented components
* the added complexity of 2 forms of state: redux state vs. routing state
* large API surface areas  of packages/frameworks
like `react-router` and `next.js`
* workarounds that such large *(likely "leaky")* abstractions inevitably require to achieve a professional app
* strategies as low level as possible to deal with animations. Animations coinciding with React 
component updates *are* a problem, particularly in the browser (React Native is better). 
"Jank" is common. Techniques  like `shouldComponentUpdate` are a must; routing frameworks 
get in the way of optimizing animations.


## The Gist
It's *set-and-forget-it*, so here's the most work you'll ever do! :+1:

```javascript
import { createStore, applyMiddleware, compose } from 'redux'
import createHistory from 'history/createBrowserHistory'

const history = createHistory()

// THE WORK:
const routesMap = { 
  HOME: '/home',
  USER: '/user/:id',
}

const { reducer, middleware, enhancer } = connectRoutes(history, routesMap) // yes, 3 redux aspects

// and you already know how the story ends:

const rootReducer = combineReducers({ location: reducer })
const middlewares = applyMiddleware(middleware)
const store = createStore(rootReducer, compose(enhancer, middlewares))
```

Based on the above `routesMap` the following actions will be dispatched when the
corresponding URL is visited, and conversely those URLs will appear in the address bar
when actions with the matching `type` and *at minimum* the required parameters are provided
as keys in the payload object:

| URL                | <-> | ACTION     |
| ------------------ |:---:| ----------:|
| /home              | <-> | { type: 'HOME' } |
| /user/1234         | <-> | { type: 'USER', payload: { id: 1234 } } |


## routesMap

The `routesMap` object allows you to match action types to express style dynamic paths, with a few frills.
Here's the complete (and very minimal easy to remember) set of configuration options available to you:

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
```
*note: the signature of `fromPath` and `toPath` offers a little more, e.g: `(pathSegment, key) => value`. Visit [routesMap docs](http://github.com/faceyspacey/pure-redux-router/docs/routesMap) for a bit more info when the time comes.*

| URL                     | <-> | ACTION     |
| ----------------------- |:---:| ----------:|
| /home                   | <-> | { type: 'HOME' } |
| /category/java-script   | <-> | { type: 'CATEGORY', payload: { cat: 'Java Script' } } |
| //user/elm/bill-gates   | <-> | { type: 'USER', payload: { cat: 'ELM', name: 'BILL GATES' } } |


## routesMap (with thunk)
We left out one other configuration key available to you if you use a *route object* instead of a path string: *a thunk*.
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
```
*Visit [locationReducer docs](http://github.com/faceyspacey/pure-redux-router/docs/locationReducer) to see what state is contained in the location reducer.*

| URL                     | <-> | ACTION     |
| ----------------------- |:---:| ----------:|
| /user/steve-jobs        | <-> | { type: 'CATEGORY', payload: { slug: 'steve-jobs' } } |
| n/a                     | n/a | { type: 'USER_FOUND', payload: { user: { name: 'Steve Jobs', slug: 'steve-jobs' } } } |
