import { actionToUrl, urlToAction } from './index'

// This will take anything you throw at it (a url string, action, or array: [url, state, key?])
// and convert it to a complete Rudy FSRA ("flux standard routing action").

// Standard Rudy practice is to convert incoming actions to their full URL form (url + state)
// and then convert that to a FSRA. THIS DOES BOTH STEPS IN ONE WHEN NECESSSARY (i.e. for actions).

export default (api, entry, st, k) => {
  if (Array.isArray(entry)) {             // entry as array of [url, state, key?]
    const [url, state, key] = entry
    return urlToAction(api, url, state, key)
  }
  else if (typeof entry === 'object') {   // entry as action object
    const key = entry.location && entry.location.key // preserve existing key if existing FSRA
    const { url, state } = actionToUrl(entry, api)
    return urlToAction(api, url, state, key)
  }

  return urlToAction(api, entry, st, k)         // entry as url string
}

