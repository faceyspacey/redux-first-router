import BrowserHistory from '../history/BrowserHistory'
import MemoryHistory from '../history/MemoryHistory'

import {
  supportsHistory,
  canUseDOM,
  hasSessionStorage,
  createPath
} from '../history/utils'

export default opts => {
  if (opts.browser === false || !canUseDOM) {
    return new MemoryHistory(opts)
  }

  if (supportsHistory()) {
    return new BrowserHistory(opts)
  }

  opts.useSessionStorage = hasSessionStorage() // give MemoryHistory browser fallback a chance to remember entries through sessionStorage
  opts.initialEntries = [createPath(window.location)]

  return new MemoryHistory(opts)
}
