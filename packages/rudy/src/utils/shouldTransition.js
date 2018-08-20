// @flow
import { PREFIX } from '../types'
import type { Action, Route, Routes } from '../flow-types'

export default (
  action: Action,
  { routes }: { routes: Routes },
): boolean | Route => {
  const { type = '' } = action
  const route = routes[type]

  return route || type.indexOf(PREFIX) > -1
}
