import { NOT_FOUND } from 'redux-first-router/types'

export default (state = 'NotFound', action = {}) => components[action.type] || state

const components = {
  HOME: 'Home',
  LIST: 'List',
  VIDEO: 'Video',
  PLAY: 'Video',
  ADMIN: 'Admin',
  LOGIN: 'Login',
  [NOT_FOUND]: 'NotFound'
}

// NOTES: this is the primary reducer demonstrating how RFR replaces the need
// for React Router's <Route /> component.
//
// ALSO:  Forget a switch, use a hash table for perf.
