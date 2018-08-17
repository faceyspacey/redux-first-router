export default (state = null, action = {}) =>
  (action.type === 'TOKEN' && action.payload) || state
