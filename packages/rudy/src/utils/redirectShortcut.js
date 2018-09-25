// @flow
import type { Dispatch, NavigationToAction, Route, Routes } from '../flow-types'
import { redirect } from '../actions'

export default ({
  route,
  routes,
  action,
  dispatch,
}: {
  route: Route,
  routes: Routes,
  action: NavigationToAction,
  dispatch: Dispatch,
}) => {
  const t = route.redirect
  // $FlowFixMe
  const scenicType = `${route.scene}/${t}`
  const type: string | Function | void = routes[scenicType] ? scenicType : t

  // $FlowFixMe
  return dispatch(redirect({ ...action, type }, 301))
}
