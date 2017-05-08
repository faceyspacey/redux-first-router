# React Native
**Redux First Router** has been thought up from the ground up with React Native (and Server Environments) in mind. They both make use of
the [history package's](https://www.npmjs.com/package/history):



## Linking
This is really where the magic of **Redux First Router** shines. Everything is supposed to be URL-based, right. So handling incoming links from *React Native's* `Linking` API should be as easy as it comes. Here's how you kick off your app from now on:

*src/linking.js:*
```js
import { push } from 'redux-first-router'
import startApp from './startApp'

Linking.getInitialURL().then(startApp)
Linking.addEventListener('url', ({ url }) => push(url))
```

*startApp.js:*
```js
import createMemoryHistory from 'history/createMemoryHistory'
import configureStore from './configureStore'
import renderApp from './renderApp'

export default url => {
  const initialPath = url.substr(url.indexOf('.com') + 5)
  const history = createMemoryHistory({
    initialEntries: [ initialPath ],  
  })
  const store = configureStore(history)
  const App = renderApp(store)

  AppRegistry.registerComponent('ReduxFirstRouterBoilerplateNative', () => App)
}
```


## Android `BackHandler`
Implementing back button handling in React Native is as easy as it comes with *Redux First Router*. It's as follows:


```js
import { BackHandler } from 'react-native'
import { back, canGoBack } from 'redux-first-router'

BackHandler.addEventListener('hardwareBackPress', () => {
  if (canGoBack()) {
    back()
    return true
  }

  return false
})
```

## First Class React Navigation Support!
This perhaps is the crowning feature of **Redux First Router**, we have a lot to share about it.

First off, all the above setup continues to be exactly how you setup your *React Navigation*-based app. However, if you've used or studied *React Navigation*,
you know that there isn't one linear history of path "entries." There in fact is a tree of them. You may have read what the *React Navigation* team had to see about this:

>A common navigation structure in iOS is to have an independent navigation stack for each tab, where all tabs can be covered by a modal. This is three layers of router: a card stack, within tabs, all within a modal stack. So unlike our experience on web apps, the navigation state of mobile apps is too complex to encode into a single URI.
https://github.com/react-community/react-navigation/blob/master/docs/blog/2017-01-Introducing-React-Navigation.md#routers-for-every-platform

That was the key realization that enabled the *React Navigation* team to finally solve the *"navigation" problem* for React. However, now that it's done, we've had a realization of our own: 

**It's possible to reconcile a linear "time track" (stack) of history entries with the tree form React Navigation maintains in your Redux store.**

And that's exactly what we've done. All you need to do is pass an Array of the navigators you're using like so:


```js
connectRoutes(history, routesMap, {
  navigators: [
    stackNav,
    drawerNav,
    tabsNav
  ]
})
```
> note: custom navigators must have a `router` key

and voila!

Our middleware we'll handle any actions dispatched by the default navigators (such as the `back` buttons). And we'll replace the `router.getActionForState` methods on your navigators for you with ones that will respond to the typical actions **Redux First Router** dispatches. From your point of view, nothing will have changed when it comes to configuring *React Navigation* reducers. What will have changed is you now get access to the seamless *Redux First Router* API you're perhaps familiar with from web.

That's not all though. You can now use `back` and `next` across all your Navigators, and it will automatically infer what to do. This makes Android's `BackHandler` a breeze. 

Most importantly though it solves several key issues that *React Navigation* will never solve: the fact that not all your states will be Navivgator-based. You now **DON'T have to setup a Navigator** just to properly respond to a URL. For example, if you want to trigger a Modal by simply doing: 

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

you can.

In large apps the reality is there will be endless cases where you want paths associated with states that your Navigator can't represent. *React Navigation* is going to get a lot more animation power, but just imagine right now you want the screen to flip around in response to **URL-driven state** (such as from clicking a coupon ad on Facebook). It's not something *React Navigation* is made for. I.e. one-off fancy state changes. I.e. the precise ones you may want to be URL-driven.

So by using *Redux First Router* as your ***"master routing controller"***, you're never left in the dust when it comes to URL-driven state.

A final issue it solves is: when you have multiple disconnected Navigators. Perhaps you have a custom drawer with a *StackNavigator* in it, which appears with a *TabNavigator* underneath it partially visible. Now you have 2 separate tracks/routers essentially. You need a *master router* to control the two if you want to respond to incoming URLs consistently. **Redux First Router** fits in a perfect place when it comes to **React Navigation**.


## How React Navigation Integration Works

*You want to know how we managed to pull this off?* The following is our tree-to-stack history reconcialiation algorithm:

* **foo bar:** bla bla bla lore ipsum
* **foo bar:** bla bla bla lore ipsum
* **foo bar:** bla bla bla lore ipsum
* **foo bar:** bla bla bla lore ipsum
* **foo bar:** bla bla bla lore ipsum
* **foo bar:** bla bla bla lore ipsum
* **foo bar:** bla bla bla lore ipsum
* ...we haven't figured it out yet if you're still seeing this, but we're working on it ;)
