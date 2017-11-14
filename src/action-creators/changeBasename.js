// @flow
import type { Action } from '../flow-types'

export default (basename: string, action: ?Action) => {
  if (!action) {
    return ({ location }) => ({
      ...location,
      meta: { basename }
    })
  }

  action.meta = action.meta || {}
  action.meta.basename = basename
  return action
}

// // @flow
// import type { Action } from '../flow-types'

// export default (action: ?(Action | string), basename: ?string) => {
//   basename = typeof action === 'string' ? action : basename
//   const act = typeof action === 'object' && action

//   if (!act) {
//     return ({ location }) => ({
//       ...location,
//       meta: { basename }
//     })
//   }

//   act.meta = act.meta || {}
//   act.meta.basename = basename
//   return act
// }

