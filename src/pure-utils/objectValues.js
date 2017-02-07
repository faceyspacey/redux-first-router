// @flow

import type { Routes, Route } from '../flow-types'


export default (routes: Routes): Array<Route> =>
  Object.keys(routes).map(key => routes[key])
