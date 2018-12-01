### Automatically change `<title>` based on the route

```js
// reducers/title.js
const DEFAULT = 'RFR demo'

export default (state = DEFAULT, action = {}) => {
  switch (action.type) {
    case 'HOME':
      return DEFAULT
    case 'USER':
      return `${DEFAULT} - user ${action.payload.id}`
    default:
      return state
  }
}
```

```js
// reducers/index.js
export { default as title } from './title'
```

```diff
// configureStore.js
+ import * as reducers from './reducers'
  import page from './pageReducer'

- const rootReducer = combineReducers({ page, location: reducer })
+ const rootReducer = combineReducers({ ...reducers, page, location: reducer })
```
