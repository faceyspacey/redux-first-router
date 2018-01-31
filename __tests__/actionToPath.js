import { actionToUrl } from '../src/utils'

it('parse action into path without params: /info', () => {
  const action = { type: 'INFO' }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param'
  }

  const path = actionToUrl(action, routesMap) /*? */
  expect(path).toEqual('/info')
})

it('parse action params into path segment: /info/foo', () => {
  const action = { type: 'INFO_PARAM', params: { param: 'foo' } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: '/info/:param'
  }

  const path = actionToUrl(action, routesMap) /*? */
  expect(path).toEqual('/info/foo')
})

it('parse action into path with numerical params key value: /info/69', () => {
  const action = { type: 'INFO_PARAM', params: { param: 69 } }
  const routesMap = {
    INFO: '/info',
    INFO_PARAM: { path: '/info/:param', capitalizedWords: true }
  }

  const path = actionToUrl(action, routesMap) /*? */
  expect(path).toEqual('/info/69')
})

it('parse action into path with parameters using route object containing capitalizedWords: true: /info/foo-bar', () => {
  const action = { type: 'INFO_PARAM', params: { param: 'Foo Bar' } }
  const routesMap = {
    INFO_PARAM: { path: '/info/:param', capitalizedWords: true }
  }

  const path = actionToUrl(action, routesMap) /*? */
  expect(path).toEqual('/info/foo-bar')
})

it('parse action into path with parameters using route object containing toPath() function: /info/foo-param-bar', () => {
  const action = { type: 'INFO_PARAM', params: { param: 'Foo Bar' } }
  const routesMap = {
    INFO_PARAM: {
      path: '/info/:param',
      toParam: (value, key) => value.replace(' ', `-${key}-`).toLowerCase()
    }
  }

  const path = actionToUrl(action, routesMap) /*? */
  expect(path).toEqual('/info/foo-param-bar')
})

it('perform no formatting when route object contains ONLY path key: /info/FooBar', () => {
  const action = { type: 'INFO_PARAM', params: { param: 'FooBar' } }
  const routesMap = {
    INFO_PARAM: { path: '/info/:param' }
  }

  const path = actionToUrl(action, routesMap) /*? */
  expect(path).toEqual('/info/FooBar')
})

it('throw error when parsing non-matched action', () => {
  const routesMap = {
    INFO: { path: '/info' }
  }

  let performMatch = () => actionToUrl({ type: 'MISSED' }, routesMap)
  expect(performMatch).toThrowError()

  performMatch = () => actionToUrl({ type: 'INFO' }, routesMap)
  expect(performMatch).not.toThrowError()
})

it('never returns an empty string when path has single optional param that is undefined', () => {
  const action = { type: 'INFO_PARAM', params: { param: undefined } }
  const routesMap = { INFO_PARAM: '/:param?' }
  const path = actionToUrl(action, routesMap) /*? */
  expect(path).toEqual('/')
})
