import createTest from '../../../../__helpers__/createTest'
import { get } from '../../../../src/history/utils/sessionStorage'
import { locationToUrl } from '../../../../src/utils'
import { set } from '../../../../src/actions'

const routes = {
  SECOND: '/second',
  FIRST: '/:foo?'
}

createTest('set(action, n)', routes, {
  testBrowser: true,
  basenames: ['/base'],
  convertNumbers: true
}, [], async ({ dispatch, getLocation }) => {
  await dispatch({ type: 'SECOND' })

  const action = {
    params: { foo: 'bar' },
    query: { hell: 'yea' },
    hash: 'yolo',
    basename: '/base',
    state: { something: 123 }
  }

  await dispatch(set(action, -1))

  expect(getLocation().entries[0].params).toEqual(action.params)
  expect(get().entries[0][1]).toEqual(action.state)

  expect(locationToUrl(window.location)).toEqual('/second')

  expect(get()).toMatchSnapshot()
  expect(getLocation()).toMatchSnapshot()
})
