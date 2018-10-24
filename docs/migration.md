In earlier versions `history` was a `peerDependency`, this is no longer the case since version 2 has its own history management tool. This means that the arguments passed to `connectRoutes`([documentation](https://github.com/faceyspacey/redux-first-router/blob/master/docs/connectRoutes.md)) need to be changed from this:


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

Change commit in `redux-first-router-demo`: [here](https://github.com/ScriptedAlchemy/redux-first-router-demo/commit/6c8238eee713ce0079aeae1ce328d305bddd0ee3#diff-04298622441e55a9d9b5691873f8490b).

And inside of your `configureStore.js` [file](https://github.com/ScriptedAlchemy/redux-first-router-demo/blob/6c8238eee713ce0079aeae1ce328d305bddd0ee3/server/configureStore.js) if you are server side rendering, change this:

 ```js
  const history = createHistory({ initialEntries: [req.path] })
  const { store, thunk } = configureStore(history, preLoadedState)
```

 To this:

 ```js
  const { store, thunk } = configureStore(preLoadedState, [req.path])
```

Change commit in `redux-first-router-demo`: [here](https://github.com/ScriptedAlchemy/redux-first-router-demo/commit/6c8238eee713ce0079aeae1ce328d305bddd0ee3#diff-538a809ba00b97f8cf4ef2f28accee51).
