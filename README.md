# Redux-First Router
Think of your app in terms of _states_, not _routes_ or _components_. Connect your components and just dispatch _Flux Standard Actions_!

<p align="center">
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src="https://img.shields.io/npm/v/redux-first-router.svg" alt="Version" />
  </a>
  
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src="https://img.shields.io/node/v/redux-first-router.svg" alt="Min Node Version: 6" />
  </a>
  
  
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src="https://img.shields.io/npm/dt/redux-first-router.svg" alt="Downloads" />
  </a>

  <a href="https://travis-ci.org/faceyspacey/redux-first-router">
    <img src="https://travis-ci.org/faceyspacey/redux-first-router.svg?branch=master" alt="Build Status" />
  </a>


## Version 2 released!
During the development of [Rudy](https://github.com/respond-framework/rudy), a few versions were released under different names and npm tags. All of these plus several PRs have been combined to a stable, up-to-date and mostly compatible version which will be supported long-term. (*See the [migration instructions](./docs/migration.md) for version 2*.)

Feature development efforts and the next version *Rudy* will be moved to a different repo in our [Respond framework](https://github.com/respond-framework) organization.


## Motivation
To be able to use Redux *as is* while keeping the address bar in sync. To define paths as actions, and handle path params and query strings as action payloads.

The address bar and Redux actions should be *bi-directionally* mapped, including via the browser's back/forward buttons. Dispatch an action and the address bar updates.
Change the address, and an action is dispatched.

In addition, here are some obstacles **Redux-First Router** seeks to *avoid*:

* Rendering from state that doesn't come from Redux
* Dealing with the added complexity from having state outside of Redux
* Cluttering components with route-related code
* Large API surface areas of frameworks like `react-router` and `next.js`
* Routing frameworks getting in the way of optimizing animations (such as when animations coincide with component updates).
* Having to do route changes differently in order to support server-side rendering.

## Usage

### Install
`yarn add redux-first-router`

(A minimal `<Link>` component exists in the separate package [`redux-first-router-link`](https://github.com/faceyspacey/redux-first-router-link).)

### Minimal example

```js
// configureStore.js
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { connectRoutes } from 'redux-first-router'

import page from './pageReducer'

const routesMap = {
  HOME: '/',
  USER: '/user/:id'
}

export default function configureStore(preloadedState) {
  const { reducer, middleware, enhancer } = connectRoutes(routesMap)

  const rootReducer = combineReducers({ page, location: reducer })
  const middlewares = applyMiddleware(middleware)
  const enhancers = compose(enhancer, middlewares)

  const store = createStore(rootReducer, preloadedState, enhancers)

  return { store }
}
```

```js
// pageReducer.js
import { NOT_FOUND } from 'redux-first-router'

const components = {
  HOME: 'Home',
  USER: 'User',
  [NOT_FOUND]: 'NotFound'
}

export default (state = 'HOME', action = {}) => components[action.type] || state
```

```js
// App.js
import React from 'react'
import { connect } from 'react-redux'

// Contains 'Home', 'User' and 'NotFound'
import * as components from './components';

const App = ({ page }) => {
  const Component = components[page]
  return <Component />
}

const mapStateToProps = ({ page }) => ({ page })

export default connect(mapStateToProps)(App)
```

```js
// components.js
import React from 'react'
import { connect } from 'react-redux'

const Home = () => <h3>Home</h3>

const User = ({ userId }) => <h3>{`User ${userId}`}</h3>
const mapStateToProps = ({ location }) => ({
  userId: location.payload.id
})
const ConnectedUser = connect(mapStateToProps)(User)

const NotFound = () => <h3>404</h3>

export { Home, ConnectedUser as User, NotFound }
```

### Recipes for...

- [Dispatching thunks & pathless routes](./examples/thunks)
- [SEO-friendly styled links](./examples/links)
- [Automatically changing page `<title>`](./examples/change-title)
- [Use Redux Devtools to debug route changes](./examples/redux-devtools)

More documentation available in [docs](./docs)

*Missing examples for your use-case? PRs are very welcome!*
*Topics waiting to be added include:*

- *Performing redirects bases on `state` and `payload`.*
- *Use hash-based routes/history (*see the [migration instructions](./docs/migration.md)*)*
- *Restoring scroll position*
- *Handling optional URL fragments and query strings*
- *Route change pre- & post-processing*
- *Code-splitting*
- *Server-side rendering*
- *Usage together with `react-universal-component`, `babel-plugin-universal-import`, `webpack-flush-chunks`.*

## Contributing
We use [commitizen](https://github.com/commitizen/cz-cli), run `npm run cm` to make commits. A command-line form will appear, requiring you answer a few questions to automatically produce a nicely formatted commit. Releases, semantic version numbers, tags, changelogs and publishing will automatically be handled based on these commits thanks to [semantic-release](https:/
/github.com/semantic-release/semantic-release).

## More from FaceySpacey in Reactlandia

<a href="https://gitter.im/Reactlandia/Lobby" target="_blank">
  <img alt="Reactlandia chat lobby" src="http://cdn.reactlandia.com/reactlandia-chat.png">
</a>

- [react-universal-component](https://github.com/faceyspacey/react-universal-component). Made to work perfectly with Redux-First Router.

- [webpack-flush-chunks](https://github.com/faceyspacey/webpack-flush-chunks). The foundation of our `Universal` product line.
