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
  convertNumbers: true
}, [], async ({ dispatch, getLocation }) => {
  await dispatch({ type: 'SECOND' })
  await dispatch(set({ params: { foo: 'bar' }, state: { hell: 'yea' } }, -1))

  expect(getLocation().entries[0].params).toEqual({ foo: 'bar' })
  expect(get().entries[0][1]).toEqual({ hell: 'yea' })

  expect(locationToUrl(window.location)).toEqual('/second')

  expect(get()).toMatchSnapshot()
  expect(getLocation()).toMatchSnapshot()
})
