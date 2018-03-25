import createTest from '../../../../__helpers__/createTest'
import { getItem } from '../../../../src/history/utils/sessionStorage'
import { locationToUrl } from '../../../../src/utils'
import {
  set,
  setParams,
  setQuery,
  setState,
  setHash,
  setBasename
} from '../../../../src/actions'

const routes = {
  SECOND: '/second/:param',
  FIRST: {
    path: '/:foo?'
  }
}

createTest('set(action, n)', routes, {
  testBrowser: true,
  convertNumbers: true
}, [], async ({ dispatch, getLocation }) => {
  await dispatch({ type: 'SECOND', params: { param: 1 } })
  await dispatch(set({ params: { foo: 'bar' }, state: { hell: 'yea' } }, -1))
  console.log('yo', getLocation())
  // expect(getLocation().entries[0].params).toEqual({ hell: 'yea' })
  // expect(locationToUrl(window.location)).toEqual('/second')

  //   const storage = getItem('history')
  //   console.log('STORAGE', storage)
  //   expect(getItem('history'))
})
