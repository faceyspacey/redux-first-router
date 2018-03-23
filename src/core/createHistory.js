import BrowserHistory from '../history/BrowserHistory'
import MemoryHistory from '../history/MemoryHistory'

import {
  supportsHistory,
  canUseDOM,
  hasSessionStorage,
  locationToUrl,
  formatSlashes
} from '../history/utils'

export default (routes, opts = {}) => {
  opts.basenames = (opts.basenames || []).map(bn => formatSlashes(bn))

  if (opts.browser === false || !canUseDOM) {
    return new MemoryHistory(routes, opts)
  }

  if (supportsHistory()) {
    return new BrowserHistory(routes, opts)
  }

  opts.useSessionStorage = hasSessionStorage() // give MemoryHistory browser fallback a chance to remember entries through sessionStorage
  opts.initialEntries = [locationToUrl(window.location)]

  return new MemoryHistory(routes, opts)
}
