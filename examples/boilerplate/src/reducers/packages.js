export default (state = [], action = {}) => {
  switch (action.type) {
    case 'LIST_COMPLETE':
      return action.payload
    default:
      return state
  }
}
