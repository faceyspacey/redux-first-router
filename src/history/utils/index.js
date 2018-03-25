export {
  supportsDom,
  supportsHistory,
  supportsSessionStorage
} from './supports'

export {
  addPopListener,
  removePopListener,
  isExtraneousPopstateEvent
} from './popListener'

export {
  saveHistory,
  restoreHistory,
  getHistoryState,
  getInitialHistoryState,
  getInitialN
} from './sessionStorage'
