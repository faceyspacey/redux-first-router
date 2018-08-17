export default (state = false, action = {}) =>
  action.type.indexOf('PLAY') > -1 || (action.type === '@@INIT' && state)

