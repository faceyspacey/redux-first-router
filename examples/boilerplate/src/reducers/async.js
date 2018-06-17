export default (state = '', action = {}) => {
  if (action.type === 'CODESPLIT' && action.location.components) {
    return action.location.components
  }

  if (action.type === 'CODESPLIT' && !action.location.components) {
    Object.assign(action.location, { components: state })
  }


  return state
}
