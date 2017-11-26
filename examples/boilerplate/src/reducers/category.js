export default (state = '', action = {}) =>
  action.type === 'LIST' ? action.payload.category : state
