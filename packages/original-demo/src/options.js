import { redirect } from 'redux-first-router'
import { isAllowed, isServer } from './utils'

export default {
  beforeEnter: ({ action, getState }) => {
    const allowed = isAllowed(action.type, getState())
    if (!allowed) return { type: 'LOGIN' }
  },
  onEnter: ({ type }) => {
    if (type === 'LOGIN' && !isServer) {
      setTimeout(displayAlert, 1500)
    }
  }
}

const msg =
  "NICE, You're adventurous! Try changing the jwToken cookie from 'fake' to 'real' in server/index.js (and manually refresh) to access the Admin Panel. Then 'onBeforeChange' will let you in."

const displayAlert = () => alert(msg)
