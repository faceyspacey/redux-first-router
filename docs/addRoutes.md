# addRoutes

Sometimes you may want to dynamically add routes to routesMap,
for example so that you can codesplit routesMap.
You can do this using the `addRoutes` function.

```javascript
import { addRoutes } from 'redux-first-router'

const newRoutes = {
  DYNAMIC_ROUTE: '/some/path'
}

store.dispatch(addRoutes(newRoutes))
```

The new routes are added to routesMap after the existing routes,
so existing routes will take precedence over the newly added routes
in the case that they overlap.

See the [original documentation in a comment](https://github.com/faceyspacey/redux-first-router/issues/62#issuecomment-322558836)
