import isLocationAction from '../src/pure-utils/isLocationAction'
import objectValues from '../src/pure-utils/objectValues'
import nestAction from '../src/pure-utils/nestAction'
import pathToAction from '../src/pure-utils/pathToAction'
import actionToPath from '../src/pure-utils/actionToPath'
import { NOT_FOUND } from '../src/actions'


it('isLocationAction(action) if has meta.location object', () => {
  let ret = isLocationAction({})
  expect(ret).toBeFalsy()

  ret = isLocationAction({ meta: { location: { } } })
  expect(ret).toBeTruthy()
})


it('objectValues(routes) converts dictionary of routes to an array of routes without the action type keys', () => {
  const routes = {
    ACTION_TYPE: '/foo/:bar',
    ACTION_TYPE_2: { path: '/path/:baz/', capitalizedWords: true },
  }

  const ret = objectValues(routes)
  expect(ret).toEqual([routes.ACTION_TYPE, routes.ACTION_TYPE_2])
  console.log(ret)
})


it('nestAction(pathname, action, location)', () => {
  const pathname = 'path'
  const receivedAction = { type: 'FOO', payload: { bar: 'baz' }, meta: { info: 'something' } }
  const location = { pathname: 'previous', type: 'PREV', payload: { bla: 'prev' } }
  const action = nestAction(pathname, receivedAction, location)

  expect(action).toMatchSnapshot()

  expect(action.type).toEqual(action.meta.location.current.type)
  expect(action.payload).toEqual(action.meta.location.current.payload)

  expect(action.meta.location.prev).toEqual(location)
  expect(action.meta).toMatchObject(receivedAction.meta)
  expect(action.meta.location.current.pathname).toEqual(pathname)

  console.log(action)
  console.log(action.meta.location)
})


describe('pathToAction(path, routes, routeNames)', () => {
  it('parse path into action using routePath without :param', () => {
    const routes = ['/info', '/info/:param/']
    const routeNames = ['INFO', 'INFO_PARAM']

    const action = pathToAction('/info', routes, routeNames)
    expect(action).toEqual({ type: 'INFO', payload: {} })
    console.log(action)
  })

  it('parse path into action using routePath with :param', () => {
    const routes = ['/info', '/info/:param/']
    const routeNames = ['INFO', 'INFO_PARAM']

    const action = pathToAction('/info/foo', routes, routeNames)
    expect(action).toEqual({ type: 'INFO_PARAM', payload: { param: 'foo' } })
    console.log(action)
  })

  it('parse path into action using route object containing capitalizedWords: true', () => {
    const path = '/info/foo-bar'
    const routes = [{ path: '/info/:param/', capitalizedWords: true }]
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(action.payload.param).toEqual('Foo Bar')
    console.log(action)
  })

  it('parse path into action using route object containing fromPath() function', () => {
    const path = '/info/foo-bar'
    const routes = [{ path: '/info/:param/', fromPath: (segment, key) => (`${segment} ${key}`).replace('-', ' ').toUpperCase() }]
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(action.payload.param).toEqual('FOO BAR PARAM')
    console.log(action)
  })

  it('parse path containing number param into action with payload value set as integer instead of string', () => {
    const path = '/info/69'
    const routes = ['/info/:param/']
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(typeof action.payload.param).toEqual('number')
    expect(action.payload.param).toEqual(69)
    console.log(action)
  })

  it('parsed path not found and return NOT_FOUND action', () => {
    const path = '/info/foo/bar'
    const routes = ['/info/:param/']
    const routeNames = ['INFO']

    const action = pathToAction(path, routes, routeNames)
    expect(action.type).toEqual(NOT_FOUND)
    console.log(action)
  })
})


describe('actionToPath(action, routesDict)', () => {
  it('parse action into path', () => {
    const routesDict = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    let action = { type: 'INFO' }
    let path = actionToPath(action, routesDict)
    expect(path).toEqual('/info')
    console.log(path)

    action = { type: 'INFO_PARAM', payload: { param: 'foo' } }
    path = actionToPath(action, routesDict)
    expect(path).toEqual('/info/foo')
    console.log(path)
  })

  it('parse action into path without parameters', () => {
    const action = { type: 'INFO' }
    const routesDict = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    const path = actionToPath(action, routesDict)
    expect(path).toEqual('/info')
    console.log(path)
  })

  it('parse action into path with parameter', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'foo' } }
    const routesDict = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    const path = actionToPath(action, routesDict)
    expect(path).toEqual('/info/foo')
    console.log(path)
  })

  it('parse action into path with number parameter', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 69 } }
    const routesDict = {
      INFO: '/info',
      INFO_PARAM: '/info/:param',
    }

    const path = actionToPath(action, routesDict)
    expect(path).toEqual('/info/69')
    console.log(path)
  })

  it('parse action into path with parameters using route object containing capitalizedWords: true', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'Foo Bar' } }
    const routesDict = {
      INFO_PARAM: { path: '/info/:param', capitalizedWords: true },
    }

    const path = actionToPath(action, routesDict)
    expect(path).toEqual('/info/foo-bar')
    console.log(path)
  })

  it('parse action into path with parameters using route object containing toPath() function', () => {
    const action = { type: 'INFO_PARAM', payload: { param: 'Foo Bar' } }
    const routesDict = {
      INFO_PARAM: { path: '/info/:param', toPath: (value, key) => value.replace(' ', `-${key}-`).toLowerCase() },
    }

    const path = actionToPath(action, routesDict)
    expect(path).toEqual('/info/foo-param-bar')
    console.log(path)
  })

  it('throw error when parsing non-matched action', () => {
    const routesDict = {
      INFO: { path: '/info' },
    }

    let performMatch = () => actionToPath({ type: 'MISSED' }, routesDict)
    expect(performMatch).toThrowError()

    performMatch = () => actionToPath({ type: 'INFO' }, routesDict)
    expect(performMatch).not.toThrowError()
  })
})
