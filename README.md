# Redux-First Router
Think of your app in terms of _states_, not _routes_ or _components_. Connect your components and just dispatch _Flux Standard Actions_!

<p align="center">
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src="https://img.shields.io/npm/v/redux-first-router.svg" alt="Version" />
  </a>
  
  <a href="https://www.npmjs.com/package/redux-first-router">
    <img src=https://img.shields.io/node/v/redux-first-router.svg" alt="Min Node Version: 8" />
  </a>

  <a href="https://travis-ci.org/faceyspacey/redux-first-router">
    <img src="https://travis-ci.org/faceyspacey/redux-first-router.svg?branch=master" alt="Build Status" />
  </a>


## Version 2 released!
During the development of [Rudy](https://github.com/respond-framework/rudy), a few versions were released under different names and npm tags. All of these plus several PRs have been combined to a stable, up-to-date and mostly compatible version which will be supported long-term. (*See the [migration instructions](https://github.com/faceyspacey/redux-first-router/tree/master/docs/migration.md) for version 2*.)

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

A minimal `<Link>` component exists in the separate package [`redux-first-router-link`](https://github.com/faceyspacey/redux-first-router-link).

### Minimal example

```js
// configureStore.js
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { connectRoutes } from 'redux-first-router'

import routesMap from './routesMap'
import page from './router/pageReducer'
import * as reducers from './reducers'

export default function configureStore(preloadedState) {
  const { reducer, middleware, enhancer, thunk } = connectRoutes(routesMap)

  const rootReducer = combineReducers({ ...reducers, page, location: reducer })
  const middlewares = applyMiddleware(middleware)
  const enhancers = compose(enhancer, middlewares)

  const store = createStore(rootReducer, preloadedState, enhancers)

  return { store, thunk }
}
```

```js
// router/routesMap.js
export default {
  HOME: '/',
  USER: '/user/:id'
}
```

```js
// router/pageReducer.js
import { NOT_FOUND } from 'redux-first-router'

const components = {
  HOME: 'Home',
  USER: 'User',
  [NOT_FOUND]: 'NotFound'
}

export default (state = 'HOME', action = {}) => components[action.type] || state
```

```js
// router/Switcher.js
import React from 'react'
import { connect } from 'react-redux'

import Home from '../components/Home'
import User from '../components/User'
import NotFound from '../components/NotFound'

const components = { Home, User, NotFound }

const Switcher = ({ page }) => {
  const Component = components[page]
  return <Component />
}

const mapStateToProps = ({ page }) => ({ page })

export default connect(mapStateToProps)(Switcher)
```

### How do I...

- [Automatically change Page `<title>`](#automatically-change-page-title)
- [Embed SEO-friendly links](#embed-seo-friendly-links)
- [Style active links](#style-active-links)
- [Dispatch thunks on route changes](#dispatch-thunks-on-route-changes)
- [Perform redirects](#perform-redirects)
- [Use hash-based routes/history](#use-hash-based-routes-history)
- [Restore scroll position](#restore-scroll-position)
- [Handle query strings](#handle-query-strings)
- [Pre- & post-process route changes](#pre-post-process-route-changes)
- [Enable code-splitting](#enable-code-splitting)
- [Use Redux Devtools to debug route changes](#use-redux-devtools-to-debug-route-changes)

#### Automatically change Page `<title>`

```js
// reducers/title.js
const DEFAULT_TITLE = 'RFR demo';

export const title = (state = DEFAULT, action = {}) => {
  switch (action.type) {
    case 'HOME':
      return DEFAULT
    case 'USER':
      return `${DEFAULT} - user ${action.payload.id}`
    default:
      return state;
  }
}
```

```js
// configureStore.js
const rootReducer = combineReducers({ page, title, location: reducer })
```

#### Embed SEO-friendly links
`yarn install redux-first-router-link`

```js
import Link from 'redux-first-router-link'

<Link to="/user/123">User 123</Link>
// Recommended approach - URLs can be changed by only modifying routesMap.js
<Link to={{ type: 'USER', payload: { id: 456 } }}>User 456</Link>

// Same as above but without SEO benefits
const mapDispatchToProps = dispatch => ({
  onClick: id => dispatch({ type: 'USER', payload: { id } })
})
```
#### Style active links
The link components are in a separate package, see above. `<NavLink />` contains props such as `activeStyle` and `activeClassName`.
**TODO**

#### Dispatch thunk on route change
**TODO**

#### Perform redirects
Redirect to another route based on `payload` and `state`.

**TODO**

#### Use hash-based routes/history
**TODO**: Introduce options.js and `createHashHistory` from `history`/`rudy-history`.
See the [migration instructions](https://github.com/faceyspacey/redux-first-router/tree/master/docs/migration.md).

#### Restore scroll position
**TODO**

#### Handle query strings
**TODO**

#### Pre- & post-process route changes
**TODO**

#### Enable code-splitting
**TODO**

#### Use Redux Devtools to debug route changes
**TODO**

## Server-side rendering

**TODO**: Usage together with
`react-universal-component`, `babel-plugin-universal-import`, `webpack-flush-chunks`.

## Contributing
We use [commitizen](https://github.com/commitizen/cz-cli), run `npm run cm` to make commits. A command-line form will appear, requiring you answer a few questions to automatically produce a nicely formatted commit. Releases, semantic version numbers, tags, changelogs and publishing will automatically be handled based on these commits thanks to [semantic-release](https:/
/github.com/semantic-release/semantic-release).

## More from FaceySpacey in Reactlandia

<a href="https://gitter.im/Reactlandia/Lobby" target="_blank">
  <img alt="Reactlandia chat lobby" src="http://cdn.reactlandia.com/reactlandia-chat.png">
</a>

- [react-universal-component](https://github.com/faceyspacey/react-universal-component). Made to work perfectly with Redux-First Router.

- [webpack-flush-chunks](https://github.com/faceyspacey/webpack-flush-chunks). The foundation of our `Universal` product line.
