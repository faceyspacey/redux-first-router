export const NOT_FOUND = '@@pure-redux-router/NOT_FOUND'

/** `go` is our sole exported action creator. However, try to use it only for quick prototyping.
 *  On web most of the time you want to use a link component that embeds an `<a />` element
 *  to the DOM for SEO purposes. See our small `<Link />`component:
 *  https://github.com/celebvidy/pure-redux-router-link
 *
 *  `back` immediately calls `history.goBack()` and in doing so is not really an action creator,
 *  but will trigger the middleware to dispatch matching actions as the address bar changes.
*/

export { go, back } from './connectTypes'
