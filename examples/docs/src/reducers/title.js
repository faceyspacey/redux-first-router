const DEFAULT = 'RFR demo'

export default (state = DEFAULT, action = {}) => {
  switch (action.type) {
    case 'HOME':
      return DEFAULT
    case 'USER':
      return `${DEFAULT} - user ${action.payload.id}`
    default:
      return state
  }
}
