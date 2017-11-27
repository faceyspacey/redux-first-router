module.exports = {
  createSmartHistory: require('./dist/smart-history/index.js').default,
  History: require('./dist/smart-history/history/History.js').default,
  MemoryHistory: require('./dist/smart-history/history/MemoryHistory.js').default,
  BrowserHistory: require('./dist/smart-history/history/BrowserHistory.js').default,
  utils: {
    dom: require('./dist/smart-history/utils/dom.js'),
    location: require('./dist/smart-history/utils/location.js'),
    path: require('./dist/smart-history/utils/path.js'),
    sessionStorage: require('./dist/smart-history/utils/sessionStorage.js'),
  }
}


/** if you want to extend History, here is how you do it:

import { History, utils } from 'rudy/smart-history'
const { createLocation } = utils.location

export default class MySmarterHistory extends History {
  push(path) {
    const location = createLocation(path)
    // do something custom
  }
}

// usage:

import { createRouter } from 'rudy'
import MySmarterHistory from '../somewhere-in-your-app/MySmarterHistory'

const createSmarterHistory = (opts) => {
  if (opts.someCondition) return new MySmarterHistory(opts)
  return createSmartHistory(opts)
}

const { middleware, reducer, firstRoute } = createRouter(routes, {
  createHistory: createSmarterHistory
})

*/
