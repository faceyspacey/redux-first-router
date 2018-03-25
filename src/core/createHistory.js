import BrowserHistory from '../history/BrowserHistory'
import MemoryHistory from '../history/MemoryHistory'
import { supportsHistory, supportsDom } from '../history/utils'
import { locationToUrl, cleanBasename } from '../utils'

export default (routes, opts = {}) => {
  opts.basenames = (opts.basenames || []).map(bn => cleanBasename(bn))

  if (!supportsDom() || opts.testBrowser === false) {
    return new MemoryHistory(routes, opts)
  }

  if (supportsHistory()) {
    return new BrowserHistory(routes, opts)
  }

  opts.initialEntries = [locationToUrl(window.location)]
  return new MemoryHistory(routes, opts)
}
