export default (state = '', action = {}) =>
  action.type === 'LIST' ? action.params.category : state
