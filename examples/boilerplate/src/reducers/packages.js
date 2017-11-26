export default (state = [], action = {}) => {
  switch (action.type) {
    case 'LIST_COMPLETE':
      console.log('COMPLETE', action)
      return action.payload
    default:
      return state
  }
}
