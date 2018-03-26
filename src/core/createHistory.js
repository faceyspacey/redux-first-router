import BrowserHistory from '../history/BrowserHistory'
import MemoryHistory from '../history/MemoryHistory'
import { supportsHistory, supportsDom } from '../history/utils'
import { cleanBasename } from '../utils'

export default (routes, opts = {}) => {
  opts.basenames = (opts.basenames || []).map(bn => cleanBasename(bn))

  return supportsDom() && supportsHistory() && opts.testBrowser !== false
    ? new BrowserHistory(routes, opts)
    : new MemoryHistory(routes, opts)
}
