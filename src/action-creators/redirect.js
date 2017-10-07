// @flow
import type { Action } from '../flow-types'
import setKind from '../pure-utils/setKind'

export default (action: Action) => setKind(action, 'redirect')
