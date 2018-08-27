// `await pop() and await snapPop` do something similar to below (see `createTest.js`).
// However we need a manual one that checks if the URL has changed as well, to insure
// that actions dispatched after a pop come after the browser would have handled the
// pop, which is asynchronous in some browsers (chrome), as well as Jest. In real life
// the user takes at lesat 65ms to pop again. In code, it's too fast at 0ms. So we
// wait a few more ms for it to actually change and trigger our pop handling code.

/* eslint-env browser */

export default () => {
  const currentUrl = window.location.href
  return haschanged(currentUrl)
}

const haschanged = async (currentUrl, tries = 1) => {
  if (tries >= 10) {
    throw new Error('awaitUrlChange reached the maximum amount of tries (10)')
  }

  await new Promise((res) => setTimeout(res, 5))
  if (currentUrl !== window.location.href) return
  return haschanged(currentUrl, ++tries)
}
