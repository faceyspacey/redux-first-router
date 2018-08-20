export { supportsDom, supportsHistory, supportsSession } from './supports'

export {
  addPopListener,
  removePopListener,
  isExtraneousPopEvent,
} from './popListener'

export {
  saveHistory,
  restoreHistory,
  get,
  set,
  clear,
  pushState,
  replaceState,
} from './sessionStorage'
