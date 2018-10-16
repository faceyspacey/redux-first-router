**Redux-First Router** now requires at least **Node 8**.


In earlier versions `history` was a `peerDependency`, this is no longer the case since version 2 has its own history management tool. This means that the arguments passed to `connectRoutes` need to be changed from this:

```js
  const { reducer, middleware, enhancer, thunk } = connectRoutes(
    history,
    routesMap,
    options
  )
```
to this:

```js
  const { reducer, middleware, enhancer, thunk } = connectRoutes(
    routesMap, {
    ...options,
    initialEntries
  })
```

If you're using a custom history type, you can still import `createHashHistory` or `createMemoryHistory` from either the `history` package or `rudy-history` and add to your options as `createHistory`.

**TODO**: Move below documentation to where it belongs.

There is also a new a third `bag` parameter in all route callbacks (`thunk`, `onBeforeChange` etc). It has the value `{ action, extra }` where `extra` is a new optional value to set in *options* that works much like the [`withExtraArgument`](https://github.com/reduxjs/redux-thunk#injecting-a-custom-argument)
feature of `redux-thunk` or the [`context`](https://graphql.org/learn/execution/#root-fields-resolvers) argument of GraphQL resolvers: any required context can be passed to your route callbacks without having to tightly couple them to it. For example a configured API client, or an `addReducer` function to dynamically inject reducers used by lazy-loaded components.
