module.exports = {
  createHistory: require('./dist/core/createHistory.js').default,
  History: require('./dist/history/History.js').default,
  MemoryHistory: require('./core/history/MemoryHistory.js').default,
  BrowserHistory: require('./core/history/BrowserHistory.js').default,
  utils: {
    dom: require('./dist/history/utils/dom.js'),
    location: require('./core/history/utils/location.js'),
    path: require('./dist/history/utils/path.js'),
    sessionStorage: require('./core/history/utils/sessionStorage.js'),
  }
}


/** if you want to extend History, here is how you do it:

import History from 'rudy/history/BrowserHistory'

class MyHistory extends History {
  push(path) {
    const location = this.createAction(path)
    // do something custom
  }
}

// usage:

import { createRouter } from 'rudy'
import { createHistory as creatHist } from 'rudy/core'

const createHistory = (routes, opts) => {
  if (opts.someCondition) return new MyHistory(routes, opts)
  return creatHist(routes, opts)
}

const { middleware, reducer, firstRoute } = createRouter(routes, { createHistory })

*/
