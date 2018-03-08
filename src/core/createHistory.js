import BrowserHistory from '../history/BrowserHistory'
import MemoryHistory from '../history/MemoryHistory'

import {
  supportsHistory,
  canUseDOM,
  hasSessionStorage,
  createPath
} from '../history/utils'

export default (routes, options) => {
  if (options.browser === false || !canUseDOM) {
    return new MemoryHistory(routes, options)
  }

  if (supportsHistory()) {
    return new BrowserHistory(routes, options)
  }

  options.useSessionStorage = hasSessionStorage() // give MemoryHistory browser fallback a chance to remember entries through sessionStorage
  options.initialEntries = [createPath(window.location)]

  return new MemoryHistory(routes, options)
}
