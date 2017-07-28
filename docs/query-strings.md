## Query Strings

Queries can be dispatched by assigning a `query` object containing key/vals to an `action`, its `payload` object or its `meta` object. 

> You will never have to deal with `search` strings directly, unless of course you want to manually supply them to `<Link />` as the `to` prop. The recommended approach is to use action objects though.

The `query` key would be solely allowed on the `action` itself, but to support *[Flux Standard Actions](https://github.com/acdlite/flux-standard-action)* we have to provide the alternate 2 strategies. 

The recommended approach is to put it on the `action` unless you're using FSAs, in which case it's up to you.


## Where `query` lives on your actions?

By the time actions reach your reducers (after they're transformed by the middleware), the `query` will exist on actions at:

- `action.query` *(only if you supplied it here)*
- `action.meta.query` *(only if you supplied it here)*
- `action.payload.query` *(only if you supplied it here)*
- `action.meta.location.current.query` *(always)*

The `<Link />` component--if you supply a string for the `to` prop--will put it on the `meta` key. If you want it elsewhere, it's recommended anyway to generate your URLs by supplying actions, in which case where you put it will be respected.

The actual search string will only ever exist at:
- `action.meta.location.current.search`

## Some Example Actions

Using links, here is some examples of how to format these actions:

*action.query:*
```js
<Link to={{ type: 'ANYTHING', payload:  { key: val }, query: { foo: 'bar' } }}>
```

*action.payload.query:*
```js
<Link to={{ type: 'ANYTHING', payload:  { key: val, query: { foo: 'bar' } } }}>
```

*action.meta.query:*
```js
<Link to={{ type: 'ANYTHING', payload:  { key: val }, meta: { query: { foo: 'bar' } } }}>
```

The matching route would be:

```js
const routesMap = {
  ANYTHING: '/anything/:key'
}
```

Notice there is no path params for query key/vals. They don't affect the determination of which route is selected. Only the `type` and `payload` do. The same `type` is shared no matter what query is provided..


## Where will `query` + `search` live in `location` state?

Here:

```js
store.getState().location.query
store.getState().location.search
```


## How to Enable Query String Serialization

To enable query string serialization you must provide a `querySerializer` option to `connectRoutes` like this:

```js
import queryString from 'query-string'

connectRoutes(routesMap, {
  querySerializer: queryString
})
```
If you would like to create your own, you can pass any object with a `stringify` and `parse` function. The former takes an object and creates a query string and the latter takes a `string` and creates an object.

Also note that the `query-string` package will produce strings for numbers. There's a [package](https://github.com/mariusc23/express-query-int) made for express that will format numbers into `ints`, which you may be interested in learning from if you want to achieve that goal. I couldn't find a general one identical to this one. If you make it, publish it to NPM and make a PR to this doc with a link to it. *I think it's a mistake that numbers aren't converted for you.*


## CodeSandBox
You can test out query support on codesandbox here:

<a href="https://codesandbox.io/s/pgp5mEkzm?module=H1Ebz7rL7rZ" target="_blank">
  <img alt="Edit Redux-First Router Demo" src="https://codesandbox.io/static/img/play-codesandbox.svg">
</a>
