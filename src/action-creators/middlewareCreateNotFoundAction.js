// @flow
import type { Location, Action, LocationState, History } from '../flow-types'
import nestAction from '../pure-utils/nestAction'
import { NOT_FOUND } from '../index'

export default (
  action: Object,
  location: LocationState,
  prevLocation: Location,
  history: History,
  notFoundPath: string
): Action => {
  const { payload } = action

  const meta = action.meta
  const prevPath = location.pathname

  const kind =
    (meta && meta.location && meta.location.kind) || // use case: kind === 'redirect'
    (location.kind === 'load' && 'load') ||
    'push'

  const pathname =
    (meta && meta.notFoundPath) ||
    (kind === 'redirect' && notFoundPath) ||
    prevPath ||
    '/'

  return nestAction(
    pathname,
    { type: NOT_FOUND, payload },
    prevLocation,
    history,
    kind
  )
}
