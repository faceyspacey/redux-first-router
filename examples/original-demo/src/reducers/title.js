export default (state = 'RFR Demo', action = {}) => {
  switch (action.type) {
    case 'HOME':
      return 'RFR Demo'
    case 'LIST':
      return `RFR: ${capitalize(action.params.category)}`
    case 'VIDEO':
      return `RFR: ${capitalize(action.params.slug)}`
    case 'LOGIN':
      return 'RFR Login'
    case 'ADMIN':
      return 'RFR Admin'
    default:
      return state
  }
}

const capitalize = str =>
  str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

// RFR automatically changes the document.title for you :)
