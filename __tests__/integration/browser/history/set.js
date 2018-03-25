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
  FIRST: {
    path: '/:foo?'
  }
}

createTest('set(action)', routes, {
  testBrowser: true
}, [], async ({ dispatch, getLocation }) => {
  await dispatch(set({ query: { hell: 'yea' }, hash: 'yolo' }))


  expect(getLocation().hash).toEqual('yolo')
  expect(locationToUrl(window.location)).toEqual('/?hell=yea#yolo')
})
