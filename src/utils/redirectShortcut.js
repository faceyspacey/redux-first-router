import { redirect } from '../actions'

export default ({ route, routes, action, dispatch }) => {
  const t = route.redirect
  const scenicType = `${route.scene}/${t}`
  const type = routes[scenicType] ? scenicType : t

  return dispatch(redirect({ ...action, type }, 301))
}
