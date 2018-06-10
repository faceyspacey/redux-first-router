export default (state = '', action = {}) => {
  if (action.type === 'CODESPLIT' && action.location.components) {
    return action.location.components[action.params.page]
  }

  return state
}
