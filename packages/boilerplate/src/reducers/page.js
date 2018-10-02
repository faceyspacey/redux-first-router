const components = {
  HOME: 'Home',
  LIST: 'List',
  NOT_FOUND: 'NotFound',
}

export default (state = 'HOME', action = {}) => {
  if (action.type === '@@rudy/ADD_ROUTES' && action.payload.routes) {
    Object.assign({ ...components, ...action.payload.routes })
    const [type] = Object.keys(action.payload.routes)
    return type
  }
  return components[action.type] || state
}

// NOTES: this is the primary reducer demonstrating how RFR replaces the need
// for React Router's <Route /> component.
//
// ALSO:  Forget a switch, use a hash table for perf.
