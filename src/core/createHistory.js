import BrowserHistory from '../history/BrowserHistory'
import MemoryHistory from '../history/MemoryHistory'
import { supportsHistory, supportsDom } from '../history/utils'
import { cleanBasename } from '../utils'

export default (routes, opts = {}) => {
  opts.basenames = (opts.basenames || []).map(bn => cleanBasename(bn))

  if (opts.testBrowser === false || !supportsDom() || !supportsHistory()) {
    return new MemoryHistory(routes, opts)
  }

  return new BrowserHistory(routes, opts)
}
