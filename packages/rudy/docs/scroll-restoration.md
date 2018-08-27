# Scroll Restoration

Complete Scroll restoration and hash `#links` handling is addressed primarily by
one of our companion packages:
[redux-first-router-restore-scroll](https://github.com/faceyspacey/redux-first-router-restore-scroll)
_(we like to save you the bytes sent to clients if you don't need it)_. In most
cases all you need to do is:

Example:

```js
import restoreScroll from 'redux-first-router-restore-scroll'
connectRoutes(history, routesMap, { restoreScroll: restoreScroll() })
```

Visit
[redux-first-router-restore-scroll](https://github.com/faceyspacey/redux-first-router-restore-scroll)
for more information and advanced usage.

## Scroll Restoration for Elements other than `window`

We got you covered. Please checkout
[redux-first-router-scroll-container](https://github.com/faceyspacey/redux-first-router-scroll-container).

## Scroll Restoration for React Native

We got you covered! Please checkout
[redux-first-router-scroll-container-native](https://github.com/faceyspacey/redux-first-router-scroll-container-native).
