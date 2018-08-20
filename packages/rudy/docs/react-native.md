# React Native

**Redux First Router** has been thought up from the ground up with React Native
(and server environments) in mind. They both make use of the
[history package's](https://www.npmjs.com/package/history)
`createMemoryHistory`. In coordination, we are able to present you with a
first-rate developer experience when it comes to URL-handling on native. We hope
you come away feeling: "this is what I've been waiting for."

> The real clincher is first class _React Navigation_ integration. Read on...

## Linking

This is really where the magic of **Redux First Router** shines. Everything is
supposed to be URL-based, right. So handling incoming links from _React
Native's_ `Linking` API should be as easy as it comes. Here's how you kick off
your app from now on:

_index.js:_

```js
import { Linking } from 'react-native'
import { push } from 'redux-first-router'
import startApp from './src'

// yes, in the latest versions of React Native,
// you can call registerComponent in a promise!
Linking.getInitialURL().then(startApp)
Linking.addEventListener('url', ({ url }) => push(url))
```

_src/index.js:_

```js
import React from 'react'
import { AppRegistry } from 'react-native'
import { Provider } from 'react-redux'
import createHistory from 'history/createMemoryHistory'
import configureStore from './configureStore'
import App from './components/App'
import config from '../config'

const env = 'development' // in a real scenario received from environment variables

export default (url) => {
  const delimiter = config(env).URI_PREFIX || '://'
  const initialPath = url ? `/${url.split(delimiter)[1]}` : '/'
  const history = createHistory({ initialEntries: [initialPath] })
  const store = configureStore(history) // configuring routesMap etc happens here
  const App = createApp(store)

  AppRegistry.registerComponent('MyApp', () => App)
}

const createApp = (store) => () => (
  <Provider store={store}>
    <App />
  </Provider>
)
```

## Android `BackHandler`

Implementing back button handling in React Native is as easy as it comes with
_Redux First Router_. It's as follows:

```js
import { BackHandler } from 'react-native'
import { back, canGoBack } from 'redux-first-router' // client-only methods come in handy here

BackHandler.addEventListener('hardwareBackPress', () => {
  if (canGoBack()) {
    back()
    return true
  }

  return false
})
```

> Visit the [client-only-api docs](./client-only-api.md) to see how to learn
> about `canGoBack` etc.

## First Class React Navigation Support!

> This is a rough sneak peak of what's possible. I'm almost done and this is the
> crown jewel of this package, and what I'm using for all my work in the coming
> months (June 2017). What we have is functional, but expect the docs to be
> completely revamped. This is just off the top of the dome for fellow
> journeymen:

First off, this relies on a plugin so it's not included in web builds.

**Installation:**

```
yarn add redux-first-router-navigation
```

**Boilerplate:**
https://github.com/faceyspacey/redux-first-router-navigation-boilerplate It's
messy as F\*\*\*. It has all the remains of everything I tried to put this
together. This is strictly for the adventurous. It will all be cleaned up by the
last week of June.

**Usage:**

```js
import { connectRoutes } from 'redux-first-router'
import reduxNavigation from 'redux-first-router-navigation'

connectRoutes(history, routesMap, {
  navigators: reduxNavigation({
    tabs: MyTabNavigator,
    stack1: Stack1Navigator,
    stack2: Stack2Navigator,
  }),
})
```

This perhaps is the crowning feature of **Redux First Router**, we have a lot to
share about it.

First off, all the above setup continues to be exactly how you setup your _React
Navigation_-based app. However, if you've used or studied _React Navigation_,
you know that there isn't one linear history of path "entries." There in fact is
a tree of them. You may have read what the _React Navigation_ team had to say
about this:

> A common navigation structure in iOS is to have an independent navigation
> stack for each tab, where all tabs can be covered by a modal. This is three
> layers of router: a card stack, within tabs, all within a modal stack. So
> unlike our experience on web apps, the navigation state of mobile apps is too
> complex to encode into a single URI.
> https://github.com/react-community/react-navigation/blob/master/docs/blog/2017-01-Introducing-React-Navigation.md#routers-for-every-platform

That was the key realization that enabled the _React Navigation_ team to finally
solve the _"navigation" problem_ for React. However, now that it's done, we've
had a **realization** of our own:

## Realization/Motivation

- Tab Navigators and Drawer Navigators have always been and still are solved
  problems as far as routing and URL-driven apps are concerned.
- It's the StackNavigator that poses some challenges. Why? Because its state
  isn't "static," but sequence-driven (i.e. its state is an array of recently
  visited "scenes").
- More importantly, React Navigation's technique of nesting Navigators causes
  more problems than it solves for serious apps. DrawerNavigator and
  TabNavigator are both not sequence-driven, and consequently can be handled
  independently in response to "either/or" state (and the actions that trigger
  it).
- "Disconnected" Navigators/Routers is the most flexible when it comes to Redux.
- The nesting of navigators makes the most sense for smaller apps and for novice
  to intermediate developers who benefit the most from a fully automated
  solution. For bigger projects and more advanced developers, its trival to
  slide to Tab 2 in response to a given state whose primary purpose is to push a
  scene on to a stack. For example, a `tabIndex` reducer can trivilialy know
  which tab to slide to by simply providing a `navKey` value in the action that
  pushes scenes/routes on to your StackRouter; if every tab has a different
  StackNavigator, each StackNavigator gets its own `navKey` value. For all such
  combinations you can dream of to combine different Navigators, you can come up
  with similarly natural solutions.
- The URL bar may not contain enough state/info to pre-fill a StackNavigator
  with a sequence of routes (though it can), but it doesn't have to when first
  entering an app in most cases.
- Therefore, you don't really need to worry about the sequences of "scenes"
  stored in your StackRouter when it comes to your app being URL-driven. When
  you do need to, say, reset a StackNavigator, you can temporarily forgo
  URL-driven actions and just perform a reset action against the given
  StackRouter.
- With disconnected Navigators, it makes it far easier to sandwitch other Views
  between navigators (e.g. put a background image behind a StackNavigator that
  itself is on top of a TabNavigator)
- It's far easier to have your Navigators talk to each other

## The Gist

> yea baby, this shit is functional!

**Installation:**

```
yarn add redux-first-router-navigation
```

**The App:**

_src/configureStore:_

```js
import { connectRoutes } from 'redux-first-router'
import reduxNavigation from 'redux-first-router-navigation'

import MyTabNavigator from './components/MyTabNavigator'
import Stack1Navigator from './components/Stack1Navigator'
import Stack2Navigator from './components/Stack2Navigator'

// ... standard configureStore stuff
connectRoutes(
  history,
  {
    FEED: { path: '/tabs/feed', navKey: 'stack1' },
    CARD: { path: '/tabs/feed/:cardId', navKey: 'stack1' },

    LATEST: { path: '/tabs/latest', navKey: 'stack2' },
    POST: { path: '/tabs/latest/:postId', navKey: 'stack2' },
  },
  {
    navigators: reduxNavigation({
      tabs: MyTabNavigator,
      stack1: Stack1Navigator,
      stack2: Stack2Navigator,
    }),
  },
)
// ... standard configureStore stuff

// now you can do stuff like this:
store.dispatch({ type: 'LATEST' })
Linking.addEventListener('url', ({ url }) => push(url)) // url === '/tabs/latest'
```

As you can see, "inter-navigator" communication is fully automated (i.e. by
dispatching type `'LATEST'`, you're directly talking to the navigator with
`navKey` "stack2"). However more importantly, within a given Navigator's
component tree, it automatically tags its actions with its given `navKey` so
other navigators won't respond to the action (and you can use the
`navigation.navigate` method you're used to):

_src/components/Stack2Navigator.js:_

```js
import Latest from './Card'
import Post from './Post'

export const Stack = StackNavigator({
  Latest: {
    screen: Latest,
    path: 'tabs/latest', // notice the paths match what's in the routesMap
  },
  Post: {
    screen: Post,
    path: 'tabs/latest/:postId', // note: paths are no longer used for Drawer or Tab Navigators
  },
})

const Stack2Navigator = ({ stack2, dispatch }) => (
  <Stack
    navigation={addNavigationHelpers({
      navKey: 'stack2',
      dispatch,
      state: stack2,
    })}
  />
)

const mapStateToProps = ({ stack2 }) => ({ stack2 })
export default connect(mapStateToProps)(Stack2Navigator)
```

_src/components/Latest.js:_

```js
export default ({ posts, navigation: { dispatch } }) => {
  <View>
    {posts.map(post => (
      <Button
        onPress={() => navigate('Post', { postId: post.id })}
        title={post.title}
      />

      // is the same as:

      <Button
        onPress={() => dispatch({ type: 'POST', payload: { postId: post.id } })}
        title={post.title}
      />
    ))}
  </View>
}

const mapStateToProps = ({ posts }) => ({ posts })
export default connect(mapStateToProps)(Latest)
```

and voila!

In both Buttons, an action is dispatched. Both have knowledge of what
StackNavigator you're talking to. Without specifying a `navKey`, they
automatically dispatch actions with the `navKey` of their parent navigator
automatically tagged.

**What about the actions dispatched by default UI elements within navigators?**

Our middleware we'll handle any actions dispatched by the default navigators
(such as the `back` buttons). And we'll replace the `router.getActionForState`
methods on your navigators for you with ones that will respond to the typical
actions **Redux First Router** dispatches. From your point of view, nothing will
have changed when it comes to configuring _React Navigation_ reducers. What will
have changed is you now get access to the seamless _Redux First Router_ API
you're perhaps familiar with from web, and you have an idiomatic way to
communciate between Navigators/routers, which is the primary pain-point in using
_React Navigation_ with Redux.

> In my opinion, _React Navigation_ started out with the concept of Redux in
> mind, but then saved Redux users for last in terms of optimizing experience
> and capabilities. **_React Navigation currently works better without Redux
> than it does with Redux--unless you're using this :)_**

That's just the beginning though. If you're reading these docs, you're an early
adopter. The React Navigation section is the latest stuff here. I've got a huge
update to the docs coming. Consider this a taste...Want to see something else
you can do to give you an idea of the scope that's possible?

```js
<Button
  onPress={() =>
    navigation.reset({
      index: 0,
      stealth: true, // control hidden navigators without animating to them!
      navKey: 'stack1',
      actions: [
        NavigationActions.navigate({
          routeName: 'Card',
          params: { cardId: 123 },
        }),
      ],
    })
  }
  title="STEALTH RESET"
/>
```

**If you're only using paths for StackNavigators, what does the state of a
TabRouter look like?**

```js
import { Tabs } from '../components/Tabs'

const initialState = Tabs.router.getStateForAction({})

export default (prev = initialState, action) => {
  let index

  if (action.stealth) {
    return prev // stealth mechanism so tabs don't slide when u dont want them to
  }

  switch (action.navKey) {
    case 'stack1':
      index = 0
      break
    case 'stack2':
      index = 1
      break
    default:
      return Tabs.router.getStateForAction(action, prev) || prev
  }

  return prev.index === index ? prev : { ...prev, index }
}
```

Yea, it's that easy to control a TabNavigator, which is why you shouldn't take
on the "frameworkESQUE" potential problems that nesting your navigators comes
with. If you've been using React Navigation, you know. In short, they built a
system based on this premise: **we need declarative stack-driven navigators;
imperative navigators no more!** But then they determined they needed to support
non-Redux users too, and so they took on the whole world and the kitchen sink.

They built a system that automatically handles all the state based on dispatch
actions like `navigation.navigate` so these kinds of users could easily use it.
As a result, a huge undertaking with a never-ending list of "leaks" was born.

I love React Navigation, but I recommend advanced users only use it for its
StackNavigator; or if you use the other 2 navigators, don't nest them. Why?
Because look how easy it is to maintain state for a TabNavigator/Router! It's
even easier for a drawer (i.e. binary). Don't take on all the bloat that has
become React Navigation if you're a strong redux developer. Period. Do not do it
to yourself.

I have far more idiomatic solutions and built-in tools that will circument 90%
of the issues in their
[evergrowing Github Issue tracker](https://github.com/react-community/react-navigation/issues).
Again, this is just a taste. Their StackNavigator is near-flawless. They have
done some amazing work. I'm in no way trying to take what they've done down a
peg. I'm just sharing my experience and perspective. Again, they really REALLY
wanted to build the be-all-end-all solution to navigators. To them, that
included a built-in solution to Drawers and Tab Routers (for simpler apps and
less experienced developers this makes a lot of sense). As a result they bit off
more than they can chew. That's my assessment. They're damn close though, but
there is still lots of
[leaks/bugs](https://github.com/react-community/react-navigation/issues). That
all said, from a marketing perspective, what they have done is great. They
captured the entire React Native community. I think it will pan out in the long
run for them.

Either way, as far as I'm concerned, if you disconnect your Navivators (i.e. so
all your Navigators are the top level parent), you can mitigate most the issues
(which you can see for yourself in
[their issue tracker](https://github.com/react-community/react-navigation/issues)).

## Onward

Perhaps most importantly though using _Redux First Navigation_ solves several
key issues that _React Navigation_ will never solve: the fact that not all your
states will be Navivgator-based. You now **DON'T have to setup a Navigator**
just to properly respond to a URL. For example, if you want to trigger a Modal
by simply doing:

```js
const App ({ showModal }) =>
  <View>
    <RestOfApp />
    {showModal && <MyModal />}
  </View>

const mapStateToProps ({ location }) => ({
  showModal: location.type === 'MODAL'
})

export default connect(mapStateToProps)(App)
```

_you can._

In large apps the reality is there will be endless cases where you want paths
associated with states that your Navigator can't represent. _React Navigation_
is going to get a lot more animation power, but just imagine right now you want
the screen to flip around in response to **URL-driven state** (such as from
clicking a coupon ad on Facebook). It's not something _React Navigation_ is made
for. I.e. one-off fancy state changes. _I.e. the precise ones you may want to be
URL-driven._

So by using _Redux First Router_ as your **"master routing controller"**, you're
never left in the dust when it comes to URL-driven state.

This will become clearer once its documentation becomes as clear as the rest of
the docs. If you want to see it in action now,
[check out the boilerplate I'm working on](https://github.com/faceyspacey/redux-first-router-navigation-boilerplate).
It's a mess as it has the remains of everything I've tried, but if this matches
your current focus, you'll be more than intrigued.

## About the Code

The way _Redux-First Router Navigation_ works is quite interesting so you may
want to check out its code:

https://github.com/faceyspacey/redux-first-router-navigation

That package is a plugin to this package. Its code is called solely from
`src/connectRoutes.js` withinin this repo. There is exactly 3 lines in that file
regarding navigation, so as to keep the web build (which doesn't need it)
minimal. Look out for the 3 corresponding functions. Basically, on startup, your
Navigators' routers are patched up as the _React Navigation_ docs recommends
(e.g: `router.getStateForAction`).

In addition, the NavigationHelpers are patched to tag dispatched actions with a
`navKey`. That code is both interesting and easy to understand.

The more complex part is how regular Redux-First Router actions are converted to
"Navigation Actions" and vice versa. I.e. if a regular React Navigation action
is received by the middleware, it converts it to one Redux-First Router
understands. And if a Redux-First Router action is received, it converts it to
one methods like `getStateForAction` can understand. This works in conjunction
with how your `getStateForAction` method is overriden in the
`patchNavigators.js` file.

> Understanding that code requires first understanding the code in this repo,
> particularly the middleware in `connectRoutes.js`.
