// @flow
import type {
  RoutesMap,
  Navigators,
  Store,
  NavigationAction
} from './flow-types'

import pathToAction from './pure-utils/pathToAction'

const __DEV__ = process.env.NODE_ENV !== 'production'

export default (
  navigators: Navigators,
  store: Store,
  routesMap: RoutesMap,
  action: Object
): {
  action: Object,
  navigationAction: ?NavigationAction
} => {
  let navigationAction
  let navKey = action.navKey

  // for convenience, also allow navKey to be specified in params
  if (action.params && typeof action.params.navKey !== 'undefined') {
    navKey = action.params.navKey
    action.navKey = navKey
  }

  if (typeof navKey !== 'string') {
    return { action, navigationAction: undefined }
  }

  const navigator = navigators[navKey]

  if (navigator) {
    const router = navigator.router
    const prevState = store.getState()[navKey]
    const state = router.getStateForActionOriginal(action, prevState)

    if (state && state !== prevState) {
      const { path, params } = router.getPathAndParamsForState(state)
      let act

      if (path) {
        act = pathToAction(`/${path}`, routesMap)
      }

      if (act && act.meta && !act.meta.notFoundPath) {
        navigationAction = action
        action = { ...action, ...act }
        action.payload = { ...action.payload, ...params }

        // ...action is nested so custom keys can be added if need be
        // but all keys that will exist at action.meta.navigationAction
        // are removed from the top level to keep the action succinct
        delete action.index
        delete action.actions
        delete action.action
        delete action.key
        delete action.params
        delete action.routeName
      }
      else if (
        __DEV__ &&
        act &&
        act.meta &&
        act.meta.notFoundPath &&
        navKey
      ) {
        action.meta = {
          warn: `navigator/router with navKey, '${navKey}', not configured with
            matching paths in routesMap passed to \`connectRoutes\`. Path tried:
            '${act.meta.notFoundPath}'. This is often the desired result
            when React Navigation's built-in components dispatch actions, especially
            when using the TabBar, whose \`state.index\` is recommended to be
            handled manually in its corresponding reducer.`
        }
      }
    }
    else if (__DEV__ && navKey) {
      action.meta = {
        warn: `state is null or stayed the same for navKey: '${navKey}'`
      }
    }
  }
  else if (__DEV__ && navKey) {
    action.meta = {
      warn: `navigator not found for navKey: '${navKey}'`
    }
  }

  return { action, navigationAction }
}
