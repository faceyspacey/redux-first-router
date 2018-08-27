// @flow
import type {
  Dispatch,
  Action,
  Options,
  Routes,
  HistoryActionDispatcher,
} from '../flow-types'

const env = process.env.NODE_ENV

export default (req: HistoryActionDispatcher): Dispatch => {
  const {
    history,
    has,
    dispatch,
    action: { payload },
  } = req

  if (env === 'development' && !has('pathlessRoute')) {
    throw new Error(
      '[rudy] "pathlessRoute" middleware is required to use history action creators.',
    )
  }

  const { method, args } = payload

  if (method === 'set') return handleEdgeCaseForSet(req, args)

  const action = history[method](...args, false)
  return dispatch(action)
}

// only state can be set before route change is committed,
// as otherwise the prev URL would change and break BrowserHistory entries tracking
// NOTE: we could greatly change the implementation to support this small thing, but its not worth the complexity;
// even just supporting setState on a previous route (while in the pipeline) is frill, but we'll soon see if people
// get use out of it.

const handleEdgeCaseForSet = (
  { ctx, tmp, commitDispatch, history }: Object,
  args: Array<Object>,
) => {
  if (ctx.pending && !tmp.committed) {
    if (!isOnlySetState(args[0])) {
      throw new Error(
        '[rudy] you can only set state on a previous url before enter',
      )
    }

    // mutable workaround to insure state is applied to ongoing action
    const prevState = ctx.pending.action.location.prev.state
    Object.assign(prevState, args[0].state)
  }

  const { commit, ...action } = history.set(...args, false)

  // unlike other actions, sets go straight to reducer (and browser history) and skip pipeline.
  // i.e. it's purpose is to be a "hard" set
  commitDispatch(action)
  action._dispatched = true // insure autoDispatch is prevented since its dispatched already here (similar to the implementation of `request.dispatch`)
  return commit(action).then(() => action)
}

const isOnlySetState = (action) =>
  action.state && Object.keys(action).length === 1
