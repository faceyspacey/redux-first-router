import createTest from '../../../../__helpers__/createTest'
import { get } from '../../../../src/history/utils/sessionStorage'
import { locationToUrl } from '../../../../src/utils'
import { jump } from '../../../../src/actions'


createTest('set(action, n)', {
  SECOND: '/second',
  FIRST: '/:foo?'
}, {
  testBrowser: true,
  basenames: ['/base', '/another'],
  convertNumbers: true
}, [], async ({ dispatch, snap, getLocation, snapPop }) => {
  expect(locationToUrl(window.location)).toEqual('/')

  await dispatch({ type: 'SECOND' })
  await snap(jump(-1))

  expect(get().entries[0][0]).toEqual('/')
  expect(locationToUrl(window.location)).toEqual('/')

  expect(get()).toMatchSnapshot()
  expect(getLocation()).toMatchSnapshot()

  await snapPop('forward')
  expect(locationToUrl(window.location)).toEqual('/second')
})
