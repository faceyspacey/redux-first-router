export default (state = [], action = {}) => {
  console.log('YOYO')
  switch (action.type) {
    case 'LIST_COMPLETE':
      return action.payload.packages
    default:
      return state
  }
}
