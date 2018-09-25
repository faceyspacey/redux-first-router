## Prefetching - coming soon!

For now, checkout:

**articles:**

- https://medium.com/webpack/how-to-use-webpacks-new-magic-comment-feature-with-react-universal-component-ssr-a38fd3e296a
- https://hackernoon.com/code-cracked-for-code-splitting-ssr-in-reactlandia-react-loadable-webpack-flush-chunks-and-1a6b0112a8b8

**pre-requesite packages:**

- https://github.com/faceyspacey/react-universal-component
- https://github.com/faceyspacey/webpack-flush-chunks
- https://github.com/faceyspacey/extract-css-chunks-webpack-plugin

_Redux First Router_ will allow you to specify chunks in your `routesMap` and
your `<Link />` components will have a `prefetch` prop you can set to `true` to
prefetch associated chunks. An imperative API via the instance ref will exist
too:

```js
const routesMap = {
  FOO: { path: '/foo/:bar', chunks: [import('./Foo')] }
}

// declarative API:
<Link prefetch href='/foo/123' />
<Link prefetch href={{ type: 'FOO', payload: { bar: 456 } }} />

// imperative API:
<Link ref={i => instance = i} href='/foo/123' />
instance.prefetch()
```
