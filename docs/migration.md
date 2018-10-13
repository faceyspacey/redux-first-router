Migration is pretty easy. Remember you can always refer to the [updated demo](https://github.com/faceyspacey/redux-first-router-demo)

In v1, `history` was a peerDependency. We have built our own history management tool, its actually part of [Rudy](https://github.com/respond-framework/rudy), but we have implemented it into RFR2. 

While RFR2 is a breaking change, its trivial to get up and running again. 

Inside of your `configureStore.js` [file](https://github.com/scriptedalchemy/redux-first-router-demo/blob/6c8238eee713ce0079aeae1ce328d305bddd0ee3/src/configureStore.js#L11),

Change this:
```js
  const { reducer, middleware, enhancer, thunk } = connectRoutes(
    history,
    routesMap,
    options
  )
```
To this:

```js
  const { reducer, middleware, enhancer, thunk } = connectRoutes(
    routesMap, {
    ...options,
    initialEntries
  })
```


There is also a new extra prop, know known as `bag` make sure to study it. 

**extra** - An optional value that will be passed as part of the third `bag` argument to all route callbacks,
including `thunk`, `onBeforeChange`, etc. It works much like the
[withExtraArgument](https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument)
feature of `redux-thunk` or the `context` argument of GraphQL resolvers.
You can use it to pass any required context to your thunks without having to tightly couple them to it.
For example, you could pass an instance of an API client initialised with authentication cookies,
or a function `addReducer` to inject new code split reducers into the store.
