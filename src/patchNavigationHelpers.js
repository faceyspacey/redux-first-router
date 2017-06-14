// @noflow
import { NavigationActions } from 'react-navigation'

const addNav = require('react-navigation/src/addNavigationHelpers')
const addNavigationHelpers = addNav.default

addNav.default = (navigation: Object) => {
  const oldDispatch = navigation.dispatch

  navigation.dispatch = (action: Object) => {
    action.navKey = typeof action.navKey !== 'undefined'
      ? action.navKey
      : navigation.navKey

    return oldDispatch(action)
  }

  navigation.reset = (payload: Object) => {
    const action = NavigationActions.reset(payload)
    return navigation.dispatch(action)
  }

  return addNavigationHelpers(navigation)
}
