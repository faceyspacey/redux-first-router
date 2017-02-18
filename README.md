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
isn't the first stab at something like this, but--aside from this path being pre-validated--we feel it is the most complete, tested and *spot on* solution. 
We have reviewed what came before, stripped what was unnecessary, added what was needed, and generally focused on getting the ***developer experience*** right. The best
part is that once you set it up there's virtually nothing left to do. It's truly "set it and forget it." Let's get started.

## Installation

Install `pure-redux-router` and its peer dependency `history` plus our `<Link />` package:

```bash
yarn install history pure-redux-router pure-redux-router-link
```

## Motivation

To be able to use Redux *as is* while keeping the URL in the address bar in sync. To automate routing. 
To think solely in terms of *"state"* and NOT routes, paths, route matching components, etc.

That means having the address bar update in response to actions and ***bi-directionally*** 
having actions dispatched in response to address bar changes, such as via the browser
back/forward buttons. The "bi-directional" aspect is embodied in the diagram above where the first arrow
points both ways--dispatching actions changes the address bar, *and* changes to
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

And here's how you'd embed SEO-friendly links in your app:
```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Link from 'pure-redux-router-link'
import store from './configureStore'

const App = () =>
  <Link href="/user/1234">User 1234</Link>

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react-root')
)
```

Based on the above `routesMap` the following actions will be dispatched when the
corresponding URL is visited, and conversely those URLs will appear in the address bar
when actions with the matching `type` and *at minimum* the required parameters are provided
as keys in the payload object:

| URL                | <-> | ACTION     |
| ------------------ |:---:| ----------:|
| /home              | <-> | { type: 'HOME' } |
| /user/1234         | <-> | { type: 'USER', payload: { id: 1234 } } |


Lastly, we haven't mentioned `pure-redux-router-link`yet--**Pure Redux Router** is purposely built in
a very modular way, which is why the `<Link />` component is in a separate package. It's extremely simple
and you're free to make your own. Basically it passes the `href` on to **Pure Redux Router** and calls
`event.preventDefault()` to stop page reloads. It also can take an action object as a prop, which it will transform
into a URL for you! The package is obvious enough once you get the hang of what's going on here--check it
out when you're ready: [pure-redux-router-link](http://github.com/faceyspacey/pure-redux-router-link). And if 
you're wondering, we don't offer route matching components like *React Router*--that's what state is for! 
See our FAQ below.

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
We left out one other configuration key available to you if you use--instead of a path string--a route object: *a thunk*.
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


## More Docs (they are short easy reads) 
* [action.meta (the `meta` key is how our system communicates & how our action maintains its status as an "FSA")](https://github.com/faceyspacey/pure-redux-router/blob/master/docs/action.md)
* [location reducer shape](https://github.com/faceyspacey/pure-redux-router/blob/master/docs/reducer.md)
* [server side rendering](https://github.com/faceyspacey/pure-redux-router/blob/master/docs/server-rendering.md)
* [connectRoutes (there is a third `options` parameter you should check out)](https://github.com/faceyspacey/pure-redux-router/blob/master/docs/connectRoutes.md)

## FAQ

What about query strings and hashes?
> Intentionally we have chosen to solely support paths since they are best for SEO and keep the API minimal. 
You are free to use query strings to request data in your thunks.

What if I don't want to use the *thunk* feature, can I use other ways of requesting the data?
> Of course. In fact we recommend strategies that totally avoid thunks, such as [Apoll's GraphQL client](https://github.com/apollographql/apollo-client).
Think of the `thunk` feature as a fallback or for simpler apps. 

Ok, but what if I request my data in `componentDidMount`?
>This works great for that, but it's a naive strategy. The problem with `componentDidMount` is that you can't generate all
the state required to render your app without first rendering your app at least once. That means additional work on your part as well as cycles
on the server. It's also means you don't get Redux's highly useful time-traveling tools. If that's where you're at in how you get things
done, that's fine--but we recommend leveling up to a "dispatch to get state" strategy, as that will provide way more predictability, which is
especially useful when it comes to testing. When it comes to server side rendering there is no better option. We recommend looking at our 
[server side rendering doc](https://github.com/faceyspacey/pure-redux-router/blob/master/docs/server-rendering.md) to see the
recommended approach. You will ultimately be doing the same as what that article describes if you're using something like Apollo as well.

The middleware dispatches thunks asyncronously with no way for me to *await* them, how can I wait for asyncronously received data on the server?
> Please visit the [server side rendering doc](https://github.com/faceyspacey/pure-redux-router/blob/master/docs/server-rendering.md). In short,
thunks are not dispatched from the middleware on the server, but `connectRoutes` in additoin to `middleware`, `enhancer`, etc returns a `thunk` 
function which you can await on, and it will retreive any data corresponding to the current route! We think our solution is slick and sensible.

The server has no `window` or `history`, how can I get that on the server?
> The [history](https://github.com/ReactTraining/history) package provides a `createMemoryHistory()` function just for this scenario.
It essentially generates a fake `history` object based on the `request.path` packages like *express* will give you. It's painless. Check it out!

Does this work with React Native?
> Yes, just like server side rendering, you can use the `history` package's `createMemoryHistory()` function. It's perfect for React Native's `Linking` API and push notifications in general. In fact, 
if you built your React Native app already and are just starting to deal with deep-linking and push notifications, **Pure Redux Router**
is perfectly suited to be tacked on in final stages with very few changes.

Ok, but there's gotta be a catch--what changes should I expect to make if I start using **Pure Redux Router**?
> Primarily it will force you to consolidate the actions you use in your reducers. Whereas before you might have had
several actions to trigger the same state, you will now centralize on a smaller number of actions that each correspond 
to a specific URL path. Your actions will become more "page-like", i.e. geared towards triggering page/URL transitions. 
That said, you absolutely don't need to have a URL for every action. In our apps, we don't. Just the actions that lead
to the biggest visual changes in the page that we want search engines to pick up.

And what about actually getting links on the page for search engines to see?
> Use [pure-redux-router-link](http://github.com/faceyspacey/pure-redux-router-link). This package has been built in a modular way,
which is why that's not in here. *pure-redux-router-link's* `<Link />` component is simple. Review its code. Perhaps you want to make your own.
All it does is take an `href`, pass that along to **Pure Redux Router** and call `event.preventDefault()` to prevent the browser
from reloading the page as it visits the new URL. The net result is you have `<a>` tags on your page for *Google* to pick up.

Why no route matching components like *React Router*?
> Because they are unnecessary when the combination of action and reducers lead to a better defined set of states, not to mention
more singular. By "singular" we mean that you don't have to think in terms of both redux state *AND* address bar paths. You just think
in terms of *state*. It makes your life simpler. It makes your code cleaner and easier to understand. It gives you the best control
React + Redux has to offer when it comes to optimizing rendering for animations. 

What about all the code splitting features stuff Next.js has to offer?
> They certainly crush it when it comes to code splitting. There's no doubt about it. But check out their Redux example
where it seems to have a different `store` per page. That's greatly complicates how you will use Redux. If your app is 
very page-like, great--but we think the whole purpose of tools like React and Redux is to build *"apps"* not *pages*. 
The hallmark of an app is seamless animated transitions where you forget you're on a specific page. You need full
control of rendering to do that at the highest level. `shouldComponentUpdate`, pure functions and [reselect](https://github.com/reactjs/reselect)
will be your best friend. Everything else gets in the way.
