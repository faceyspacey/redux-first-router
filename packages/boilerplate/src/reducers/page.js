export default (state = 'HOME', action = {}) => {
  if (action.components) {
    // assuming an action has components, add it as a route.. for now
    Object.assign(components, { [action.type]: action.components })
  }
  return components[action.type] || state
}

const components = {
  HOME: 'Home',
  LIST: 'List',
  NOT_FOUND: 'NotFound',
}

// NOTES: this is the primary reducer demonstrating how RFR replaces the need
// for React Router's <Route /> component.
//
// ALSO:  Forget a switch, use a hash table for perf.
