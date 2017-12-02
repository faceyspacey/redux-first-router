export {
  canUseDOM,
  supportsHistory,
  hasSessionStorage,
  isExtraneousPopstateEvent,
  createPopListenerFuncs
} from './dom'

export {
  createLocation,
  getWindowLocation,
  createKey
} from './location'

export {
  stripSlashes,
  hasBasename,
  stripBasename,
  findBasename,
  parsePath,
  createPath,
  transformEntry
} from './path'

export {
  saveHistory,
  restoreHistory,
  getHistoryState,
  getInitialHistoryState
} from './sessionStorage'
