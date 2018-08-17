export default (state = '', action = {}) =>
  /^(VIDEO|PLAY)$/.test(action.type) ? action.params.slug : state

// Using RFR is all about effectively making use of path segments. For good
// SEO, slugs will become your best friend.
//
// Make note of the simplicity of how path parameters become your params.
