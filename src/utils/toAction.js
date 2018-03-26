import { actionToUrl, urlToAction } from './index'

// This will take anything you throw at it (a url string, action, or array: [url, state, key?])
// and convert it to a complete Rudy FSRA ("flux standard routing action").

// Standard Rudy practice is to convert incoming actions to their full URL form (url + state)
// and then convert that to a FSRA. THIS DOES BOTH STEPS IN ONE WHEN NECESSSARY (i.e. for actions).
//
// For reference, the `transformAction` middleware also performs both steps, though without
// using this utility function. Instead `urlToAction` is called indirectly when the middleware
// calls `history.push/etc`.
//
// This is used by Rudy itself in a few places where we have to work with existing entries/actions,
// eg: `history.set` and `history.reset`. But it's highly useful in userland.

export default (entry, api) => {
  if (Array.isArray(entry)) {             // entry as array of [url, state, key?]
    const [url, state, key] = entry
    return urlToAction(url, api, state, key)
  }
  else if (typeof entry === 'object') {   // entry as action object
    const key = entry.location && entry.location.key // preserve existing key if existing FSRA
    const { url, state } = actionToUrl(entry, api)
    return urlToAction(url, api, state, key)
  }

  return urlToAction(entry, api)         // entry as url string
}

