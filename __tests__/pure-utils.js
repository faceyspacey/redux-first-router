import { createMemoryHistory, createBrowserHistory } from 'rudy-history'

import { setupAll } from '../__test-helpers__/setup'

import isLocationAction from '../src/pure-utils/isLocationAction'
import isServer from '../src/pure-utils/isServer'
import objectValues from '../src/pure-utils/objectValues'
import nestAction, { nestHistory } from '../src/pure-utils/nestAction'
import pathToAction from '../src/pure-utils/pathToAction'
import actionToPath from '../src/pure-utils/actionToPath'
import changePageTitle from '../src/pure-utils/changePageTitle'

import { NOT_FOUND, addRoutes } from '../src/index'

beforeEach(() => {
  window.SSRtest = false
})

it('isLocationAction(action) if has meta.location object', () => {
  let ret = isLocationAction({})
  expect(ret).toBeFalsy()

  ret = isLocationAction({ meta: { location: { current: {} } } })
  expect(ret).toBeTruthy()
})

it('isServer()', () => {
  expect(isServer()).toEqual(false)

  global.window.SSRtest = true
  expect(isServer()).toEqual(true)
  delete global.window.SSRtest
})

it('objectValues(routesMap) converts map of routes to an array of routes without the action type keys', () => {
  const routesMap = {
    ACTION_TYPE: '/foo/:bar',
    ACTION_TYPE_2: { path: '/path/:baz/', capitalizedWords: true }
  }

  const ret = objectValues(routesMap)
  expect(ret).toEqual([routesMap.ACTION_TYPE, routesMap.ACTION_TYPE_2]) /*? */
})

describe('nestAction(pathname, receivedAction, prevLocation, history, kind?)', () => {
  it('nestAction properly formats/nests action object', () => {
    const history = createMemoryHistory()
    const pathname = '/path'
    const receivedAction = {
      type: 'FOO',
      payload: { bar: 'baz' },
      meta: { info: 'something' }
    }
    const location = {
      pathname: 'previous',
      type: 'PREV',
      payload: { bla: 'prev' }
    }

    let action = nestAction(
      pathname,
      receivedAction,
      location,
      history
    ) /*? $.meta */

    expect(action.type).toEqual('FOO')
    expect(action.payload).toEqual({ bar: 'baz' })

    expect(action.type).toEqual(action.meta.location.current.type)
    expect(action.payload).toEqual(action.meta.location.current.payload)

    expect(action.meta.location.prev).toEqual(location)
    expect(action.meta).toMatchObject(receivedAction.meta)
    expect(action.meta.location.current.pathname).toEqual(pathname)

    expect(action).toMatchSnapshot()

    expect(action.meta.location.kind).not.toBeDefined()
    action = nestAction(pathname, receivedAction, location, history, 'load')
    expect(action.meta.location.kind).toEqual('load')

    action = nestAction(pathname, receivedAction, location, history, 'pop')
    expect(action.meta.location.kind).toEqual('pop')
  })

  it('nestHistory formats simplified history object for action + state', () => {
    const history = createMemoryHistory() // still use `createMemoryHistory` for stability during tests
    history.push('/foo')
    history.push('/bar/baz')

    const nestedHistory = nestHistory(history) /*? */
    expect(nestedHistory).toMatchSnapshot()
  })

  it('nestHistory returns undefined when using createBrowserHistory', () => {
    const history = createBrowserHistory()
    const nestedHistory = nestHistory(history)
    expect(nestedHistory).toEqual(undefined)
  })
})

describe('pathToAction(path, routesMap)', () => {
  it('parse path into action using routePath without /:param segment', () => {
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param'
    }

    const action = pathToAction('/info', routesMap)
    expect(action).toEqual({ type: 'INFO', payload: {}, meta: {} }) /*? */
  })

  it('parse path into action using routePath with /:param segment', () => {
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param'
    }

    const action = pathToAction('/info/foo', routesMap)
    expect(action).toEqual({
      type: 'INFO_PARAM',
      payload: { param: 'foo' },
      meta: {}
    }) /*? */
  })

  it('parse path (/info/foo-bar) into action using route object containing capitalizedWords: true: payload: { param: "Foo Bar" }', () => {
    const path = '/info/foo-bar'
    const routesMap = {
      INFO_PARAM: { path: '/info/:param/', capitalizedWords: true }
    }

    const action = pathToAction(path, routesMap) /*? */
    expect(action.payload.param).toEqual('Foo Bar')
  })

  it('parse path into action using route object containing fromPath() function', () => {
    const path = '/info/foo-bar/1'
    const routesMap = {
      INFO_PARAM: {
        path: '/info/:param/:param2',
        fromPath: (segment, key) =>
          (key === 'param2'
            ? segment
            : `${segment} ${key}`.replace('-', ' ').toUpperCase())
      }
    }

    const action = pathToAction(path, routesMap) /*? */
    expect(action.payload.param).toEqual('FOO BAR PARAM')
    expect(action.payload.param2).toEqual('1')
  })

  it('parse path containing number param into action with payload value set as integer instead of string', () => {
    const path = '/info/69'
    const routesMap = {
      INFO_PARAM: { path: '/info/:param/', coerceNumbers: true }
    }

    const action = pathToAction(path, routesMap) /*? */
    expect(typeof action.payload.param).toEqual('number')
    expect(action.payload.param).toEqual(69)
  })

  it('parse path containing number param into action with payload value set as string instead of integer', () => {
    const path = '/info/69'
    const routesMap = {
      INFO_PARAM: { path: '/info/:param/', coerceNumbers: false }
    }

    const action = pathToAction(path, routesMap) /*? */
    expect(typeof action.payload.param).toEqual('string')
    expect(action.payload.param).toEqual('69')
  })

  it('does not parse a blank string "" as NaN', () => {
    const path = '/info'
    const routesMap = {
      INFO_WILDCARD: { path: '/info(.*)' }
    }

    const action = pathToAction(path, routesMap)
    expect(action.payload[0]).toEqual('')
  })

  it('parsed path not found and return NOT_FOUND action.type: "@@redux-first-router/NOT_FOUND"', () => {
    const path = '/info/foo/bar'
    const routesMap = {
      INFO_PARAM: { path: '/info/:param/' }
    }

    const action = pathToAction(path, routesMap) /*? */
    expect(action.type).toEqual(NOT_FOUND)
  })

  it('strips basename if first segment in path', () => {
    const path = '/base/foo/bar'
    const routesMap = {
      FOO: { path: '/foo/bar' }
    }

    const action = pathToAction(path, routesMap, undefined, '/base') /*? */
    expect(action.type).toEqual('FOO')
  })

  it('returns NOT_FOUND with a strict match with/without trailing delimiter', () => {
    const path = '/foo/'
    const routesMap = {
      FOO: { path: '/foo' }
    }

    let strict = true
    let action = pathToAction(path, routesMap, undefined, undefined, strict) /*? */
    expect(action.type).toEqual(NOT_FOUND)

    strict = false
    action = pathToAction(path, routesMap, undefined, undefined, strict) /*? */
    expect(action.type).toEqual('FOO')
  })
})

describe('actionToPath(action, routesMap)', () => {
  it('parse action into path without payload: /info', () => {
    const action = { type: 'INFO' }
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param'
    }

    const path = actionToPath(action, routesMap) /*? */
    expect(path).toEqual('/info')
  })

  it('parse action payload into path segment: /info/foo', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'foo' } }
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: '/info/:param'
    }

    const path = actionToPath(action, routesMap) /*? */
    expect(path).toEqual('/info/foo')
  })

  it('parse action into path with numerical payload key value: /info/69', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 69 } }
    const routesMap = {
      INFO: '/info',
      INFO_PARAM: { path: '/info/:param', capitalizedWords: true }
    }

    const path = actionToPath(action, routesMap) /*? */
    expect(path).toEqual('/info/69')
  })

  it('parse action into path with parameters using route object containing capitalizedWords: true: /info/foo-bar', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'Foo Bar' } }
    const routesMap = {
      INFO_PARAM: { path: '/info/:param', capitalizedWords: true }
    }

    const path = actionToPath(action, routesMap) /*? */
    expect(path).toEqual('/info/foo-bar')
  })

  it('parse action into path with parameters using route object containing toPath() function: /info/foo-param-bar', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'Foo Bar' } }
    const routesMap = {
      INFO_PARAM: {
        path: '/info/:param',
        toPath: (value, key) => value.replace(' ', `-${key}-`).toLowerCase()
      }
    }

    const path = actionToPath(action, routesMap) /*? */
    expect(path).toEqual('/info/foo-param-bar')
  })

  it('perform no formatting when route object contains ONLY path key: /info/FooBar', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'FooBar' } }
    const routesMap = {
      INFO_PARAM: { path: '/info/:param' }
    }

    const path = actionToPath(action, routesMap) /*? */
    expect(path).toEqual('/info/FooBar')
  })

  it('throw error when parsing non-matched action', () => {
    const routesMap = {
      INFO: { path: '/info' }
    }

    let performMatch = () => actionToPath({ type: 'MISSED' }, routesMap)
    expect(performMatch).toThrowError()

    performMatch = () => actionToPath({ type: 'INFO' }, routesMap)
    expect(performMatch).not.toThrowError()
  })

  it('never returns an empty string when path has single optional param that is undefined', () => {
    const action = { type: 'INFO_PARAM', payload: { param: undefined } }
    const routesMap = { INFO_PARAM: '/:param?' }
    const path = actionToPath(action, routesMap) /*? */
    expect(path).toEqual('/')
  })
})

describe('changePageTitle()', () => {
  it('when title changes set it to document.title', () => {
    const document = {}
    const title = 'foo'

    const ret = changePageTitle(document, title)

    expect(document).toEqual({ title: 'foo' })
    expect(ret).toEqual('foo')
  })

  it('when title changes do not set document.title', () => {
    const document = { title: 'foo' }
    const title = 'foo'

    const ret = changePageTitle(document, title)

    expect(document).toEqual({ title: 'foo' })
    expect(ret).toEqual(null) // no return value when title does not change
  })
})

describe('confirmLeave()', () => {
  it('can leave (via confirmLeave returning falsy)', () => {
    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => undefined
      },
      SECOND: '/second'
    }

    const displayConfirmLeave = jest.fn()
    const options = { displayConfirmLeave }
    const { store, history } = setupAll('/first', options, { routesMap })
    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual('SECOND')
    expect(displayConfirmLeave).not.toBeCalled()
    expect(history.location.pathname).toEqual('/second')
  })

  it('can leave (via user decision)', () => {
    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => {
          const message = 'are u sure u wanna leave?'

          if (action.type === 'SECOND' && state.location.type === 'FIRST') {
            return message
          }
        }
      },
      SECOND: '/second'
    }

    const options = {
      displayConfirmLeave: (message, callback) => {
        callback(true)
      }
    }
    const { store, history } = setupAll('/first', options, { routesMap })
    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual('SECOND')
    expect(history.location.pathname).toEqual('/second')
  })

  it('cannot leave (via user decision)', () => {
    const message = 'are u sure u wanna leave?'

    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => {
          if (action.type === 'SECOND' && state.location.type === 'FIRST') {
            return message
          }
        }
      },
      SECOND: '/second'
    }

    const options = {
      displayConfirmLeave: (msg, callback) => {
        expect(msg).toEqual(message)
        callback(false)
      }
    }
    const { store, history } = setupAll('/first', options, { routesMap })
    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual('FIRST')
    expect(history.location.pathname).toEqual('/first')
  })

  it('can leave (via user decision - default using window.confirm)', () => {
    window.confirm = msg => {
      expect(msg).toEqual(message)
      return true
    }
    const message = 'are u sure u wanna leave?'

    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => {
          if (action.type === 'SECOND' && state.location.type === 'FIRST') {
            return message
          }
        }
      },
      SECOND: '/second'
    }

    const { store, history } = setupAll('/first', undefined, { routesMap })
    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual('SECOND')
    expect(history.location.pathname).toEqual('/second')
  })

  it('HISTORY: can leave (via confirmLeave returning falsy)', () => {
    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => undefined
      },
      SECOND: '/second'
    }

    const displayConfirmLeave = jest.fn()
    const options = { displayConfirmLeave }
    const { history, store } = setupAll('/first', options, { routesMap })
    history.push('/second')

    const { type } = store.getState().location
    expect(type).toEqual('SECOND')
    expect(displayConfirmLeave).not.toBeCalled()
  })

  it('HISTORY: can leave (via user decision)', () => {
    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => {
          const message = 'are u sure u wanna leave?'

          if (action.type === 'SECOND' && state.location.type === 'FIRST') {
            return message
          }
        }
      },
      SECOND: '/second'
    }

    const options = {
      displayConfirmLeave: (message, callback) => {
        callback(true)
      }
    }
    const { store, history } = setupAll('/first', options, { routesMap })
    history.push('/second')

    const { type } = store.getState().location
    expect(type).toEqual('SECOND')
    expect(history.location.pathname).toEqual('/second')
  })

  it('HISTORY: cannot leave (via user decision)', () => {
    const message = 'are u sure u wanna leave?'

    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => {
          if (action.type === 'SECOND' && state.location.type === 'FIRST') {
            return message
          }
        }
      },
      SECOND: '/second'
    }

    const options = {
      displayConfirmLeave: (msg, callback) => {
        expect(msg).toEqual(message)
        callback(false)
      }
    }
    const { history, store } = setupAll('/first', options, { routesMap })
    history.push('/second')

    const { type } = store.getState().location
    expect(type).toEqual('FIRST')
    expect(history.location.pathname).toEqual('/first')
  })

  it('can block leaving after addRoutes if confirmLeave was missing on init', () => {
    const firstRouteName = 'FIRST'

    const firstRouteOptions = {
      path: '/first'
    }

    const routesMap = {
      [firstRouteName]: firstRouteOptions,
      SECOND: '/second'
    }

    const displayConfirmLeave = jest.fn()
    const options = { displayConfirmLeave }
    const { store, history } = setupAll('/first', options, { routesMap })
    const confirmLeave = jest.fn((state, action) => 'blocked')

    store.dispatch(
      addRoutes({
        [firstRouteName]: {
          ...firstRouteOptions,
          confirmLeave
        }
      })
    )

    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual(firstRouteName)
    expect(displayConfirmLeave).toBeCalled()
    expect(history.location.pathname).toEqual('/first')
    expect(confirmLeave).toBeCalled()
  })

  it('can block leaving after addRoutes if confirmLeave was passing on init', () => {
    const firstRouteName = 'FIRST'

    const firstRouteOptions = {
      path: '/first'
    }

    const prevConfirmLeave = jest.fn((state, action) => undefined)
    const nextConfirmLeave = jest.fn((state, action) => 'blocked')

    const routesMap = {
      [firstRouteName]: {
        ...firstRouteOptions,
        confirmLeave: prevConfirmLeave
      },
      SECOND: '/second'
    }

    const displayConfirmLeave = jest.fn()
    const options = { displayConfirmLeave }
    const { store, history } = setupAll('/first', options, { routesMap })

    store.dispatch(
      addRoutes({
        [firstRouteName]: {
          ...firstRouteOptions,
          confirmLeave: nextConfirmLeave
        }
      })
    )

    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual(firstRouteName)
    expect(displayConfirmLeave).toBeCalled()
    expect(history.location.pathname).toEqual('/first')
    expect(prevConfirmLeave).not.toBeCalled()
    expect(nextConfirmLeave).toBeCalled()
  })

  it('can unblock leaving after addRoutes removing blocking confirmLeave', () => {
    const firstRouteName = 'FIRST'

    const firstRouteOptions = {
      path: '/first'
    }

    const confirmLeave = jest.fn((state, action) => 'blocked')

    const routesMap = {
      [firstRouteName]: {
        ...firstRouteOptions,
        confirmLeave
      },
      SECOND: '/second'
    }

    const displayConfirmLeave = jest.fn()
    const options = { displayConfirmLeave }
    const { store, history } = setupAll('/first', options, { routesMap })

    store.dispatch(
      addRoutes({
        [firstRouteName]: firstRouteOptions
      })
    )

    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual('SECOND')
    expect(displayConfirmLeave).not.toBeCalled()
    expect(history.location.pathname).toEqual('/second')
    expect(confirmLeave).not.toBeCalled()
  })

  it('can unblock leaving after addRoutes if confirmLeave was blocking on init', () => {
    const firstRouteName = 'FIRST'

    const firstRouteOptions = {
      path: '/first'
    }

    const prevConfirmLeave = jest.fn((state, action) => 'blocked')
    const nextConfirmLeave = jest.fn((state, action) => undefined)

    const routesMap = {
      [firstRouteName]: {
        ...firstRouteOptions,
        confirmLeave: prevConfirmLeave
      },
      SECOND: '/second'
    }

    const displayConfirmLeave = jest.fn()
    const options = { displayConfirmLeave }
    const { store, history } = setupAll('/first', options, { routesMap })

    store.dispatch(
      addRoutes({
        [firstRouteName]: {
          ...firstRouteOptions,
          confirmLeave: nextConfirmLeave
        }
      })
    )

    store.dispatch({ type: 'SECOND' })

    const { type } = store.getState().location
    expect(type).toEqual('SECOND')
    expect(displayConfirmLeave).not.toBeCalled()
    expect(history.location.pathname).toEqual('/second')
    expect(prevConfirmLeave).not.toBeCalled()
    expect(nextConfirmLeave).toBeCalled()
  })

  it('can leave throws (React Native where window.confirm does not exist)', () => {
    global.confirm = undefined

    const message = 'are u sure u wanna leave?'

    const routesMap = {
      FIRST: {
        path: '/first',
        confirmLeave: (state, action) => {
          if (action.type === 'SECOND' && state.location.type === 'FIRST') {
            return message
          }
        }
      },
      SECOND: '/second'
    }

    const { store, history } = setupAll('/first', undefined, { routesMap })
    expect(() => store.dispatch({ type: 'SECOND' })).toThrow()

    const { type } = store.getState().location
    expect(type).toEqual('FIRST')
    expect(history.location.pathname).toEqual('/first')
  })
})
