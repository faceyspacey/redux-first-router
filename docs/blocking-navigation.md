# Blocking navigation

Sometimes you may want to block navigation away from the current route,
for example to prompt the user to save their changes.

This is supported - here's how you use it:

```js
const routesMap = {
   HOME: '/'
   FOO: {
      path: '/foo',
      confirmLeave: (state, action) => {
         if (!state.formComplete && action.type === 'HOME' ) {
             return 'Are you sure you want to leave without completing your purchase?'
         }
     }
  }
}
```

So each route can have a `confirmLeave` option, and if you return a string it will be shown in the `confirm` yes|no dialog. If you return a falsy value such as undefined, the user will be able to navigate away from the current route without being shown any dialog.

If you'd like to customize that dialog (which is required in React Native since there is no `window.confirm` in React Native), you can pass a `displayConfirmLeave` option to `connectRoutes` like so:

```js
const options = {
  displayConfirmLeave: (message, callback) => {
    showModalConfirmationUI({
       message,
       stay: () => callback(false),
       leave: () => callback(true)
    })
  }
}

connectRoutes(history, routesMap, options)
```
> so `showModalConfirmationUI` is an example of a function you can make to display a confirmation modal. If the user presses **OK** call the `callback` with `true` to proceed with navigating to the the route the user was going to. And pass `false` to block the user. 

One special thing to note is that if you define this function in the same scope that is likely created below, you can use `store.dispatch` to trigger showing the modal instead. You could even do:

```js
store.dispatch({ type: 'SHOW_BLOCK_NAVIGATION_MODAL', payload: { callback } })
```

and then grab the callback in your `<Modal />` component. Since this is happening solely on the client and the store will never need to serialize that `callback` (as you do when rehydrating from the server), this is a fine pattern. Redux store state can contain functions, components, etc, if you choose. The result in this case is something highly idiomatic when it comes to how you render the React component corresponding to the modal. *No imperative tricks required.*

Here's a final example:

*src/reducers/blockNavigation.js:*

```js
export default (state = {}, action = {}) => {
  switch (type): {
    case 'SHOW_BLOCK_NAVIGATION_MODAL':
       const { message, canLeave } = action.payload
       return { message, canLeave  }
    case 'HIDE_BLOCK_NAVIGATION_MODEL':
       return {}
    default:
       return state
  }
}
```

*src/components/BlockModal.js:*

```js
const BlockModal = ({ show, message, cancel, ok }) =>
  !show 
    ? null
    : <div className={styles.modal}>
        <h1>{message}</h1>

        <div className={styles.modalFooter}>
               <span onClick={cancel}>CANCEL</span>
               <span onClick{ok}>OK</span>
        </div>
   </div>

const mapState = ({ blockNavigation: { message, canLeave } }) => ({
   show: !!message,
   message,
   cancel: () => canLeave(false),
   ok: () => canLeave(true)
})

export default connect(mapState)(BlockModal)
```
> obviously you could wrap `<BlockModal />` in a [transition-group](https://github.com/faceyspacey/transition-group) to create a nice fadeIn/Out animation


*src/components/App.js*

```js
export default () =>
   <div>
       <OtherStuff />
       <BlockModal />
   </div>
```


*src/configureStore.js:*
```js
const routesMap = {
   HOME: '/'
   FOO: {
      path: '/foo',
      confirmLeave: (state, action) => {
         if (!state.formComplete && action.type === 'HOME' ) {
             return 'Are you sure you want to leave without completing your purchase?'
         }
     }
  }
}

const options = {
  displayConfirmLeave: (message, callback) => {
     const canLeave = can => {
        store.dispatch({ type: 'HIDE_BLOCK_NAVIGATION_MODEL' }) // hide modal
        return callback(can) // navigate to next route or stay where ur at
     }

     store.dispatch({ 
       type: 'SHOW_BLOCK_NAVIGATION_MODAL',
       payload: { message, canLeave } 
     })
  }
}

const { reducer, middleware, enhancer } = connectRoutes(history, routesMap, options)

const rootReducer = combineReducers({ ...reducers, location: reducer })
const middlewares = applyMiddleware(middleware)
const enhancers = composeEnhancers(enhancer, middlewares)
const store = createStore(rootReducer, preLoadedState, enhancers)
```
