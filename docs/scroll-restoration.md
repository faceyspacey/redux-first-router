# Scroll Restoration

We have a companion package, [redux-first-router-restore-scroll](https://github.com/faceyspacey/redux-first-router-restore-scroll), which provides full-on scroll restoration through the call of a single function. It also insures hash changes work as you would expect (e.g. like when you click `#links` to different section of a Github readme it automatically scrolls, and allows you to use the browser back/next buttons to move between sections you've visited). 

Example:

```js
import restoreScroll from 'redux-first-router-restore-scroll'

connectRoutes(history, routesMap, {
  restoreScroll: restoreScroll((prev, locationState) => {
    // disable scroll restoration on history state changes
    // note: this is useful if you want to maintain scroll position from previous route
    if (prev.type === 'HOME' && locationState.type === 'CATEGORY') {
      return false
    }

    // scroll into view HTML element with this ID or name attribute value
    else if (locationState.load && locationState.type === 'USER') {
      return 'profile-box'
    }


    // return an array of xy coordinates to scroll there
    else if (locationState.payload.coords) {
      return [coords.x, coords.y]
    }

    // Accurately emulate the default behavior of scrolling to the top on new history
    // entries, and to previous positions on pop state + hash changes.
    // This is the default behavior, and this callback is not needed if this is all you want.
    return true
  })
})
```

## Notes
Modern browsers like Chrome attempt to provide the default behavior, but we have found
it to be flakey in fact. It's pretty good in Chrome, but doesn't always happen. If all you want is the default behavior and nothing more,
simply `return true` as above or even better, just call `restoreScroll()`:

```js
import restoreScroll from 'redux-first-router-restore-scroll'
connectRoutes(history, routesMap, { restoreScroll: restoreScroll() })
```

We try to make everything as modular as possible and not making assumptions on how many bytes/packages you ship to your clients,
hence we try to break out as many such features into independent companion packages as possible. 

## Scroll Restoration for Elements other than `window`
We got you covered. Please checkout [redux-first-router-scroll-container](https://github.com/faceyspacey/redux-first-router-scroll-container).

## Scroll Restoration for React Native
We got you covered! Please checkout [redux-first-router-scroll-container-native](https://github.com/faceyspacey/redux-first-router-scroll-container-native).

## Thanks
Our Scroll Restoration package comes thanks to: https://github.com/taion/scroll-behavior, which powered [react-router-scroll](https://github.com/taion/react-router-scroll) in older versions of React Router. See either for more information on how this works.
