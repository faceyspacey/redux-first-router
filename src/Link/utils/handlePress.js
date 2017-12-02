// @flow
import { redirect } from '../../actions'
import type { RoutesMap, ReceivedAction } from '../../index'
import type { To } from './toUrl'

export type OnClick = false | ((SyntheticEvent) => ?boolean)
export default (
  action: ?ReceivedAction,
  routes: RoutesMap,
  shouldDispatch: boolean,
  dispatch: Function,
  onClick?: ?OnClick,
  target: ?string,
  isRedirect?: boolean,
  e: SyntheticEvent
) => {
  const prevented = e.defaultPrevented
  const notModified = !isModified(e)
  let shouldGo = true

  if (onClick) {
    shouldGo = onClick(e) !== false // onClick can return false to prevent dispatch
  }

  if (!target && e && e.preventDefault && notModified) {
    e.preventDefault()
  }


  if (
    action &&
    shouldGo &&
    shouldDispatch &&
    !target &&
    !prevented &&
    notModified &&
    e.button === 0
  ) {
    action = isRedirect ? redirect(action) : action
    return dispatch(action)
  }
}


const isModified = (e: Object) =>
  !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
