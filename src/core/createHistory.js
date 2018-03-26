import BrowserHistory from '../history/BrowserHistory'
import MemoryHistory from '../history/MemoryHistory'
import { supportsHistory, supportsDom } from '../history/utils'

export default (routes, opts = {}) =>
  supportsDom() && supportsHistory() && opts.testBrowser !== false
    ? new BrowserHistory(routes, opts)
    : new MemoryHistory(routes, opts)

