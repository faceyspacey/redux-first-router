import createTest from '../../../../__helpers__/createTest'
import { getItem } from '../../../../src/history/utils/sessionStorage'
import { locationToUrl } from '../../../../src/utils'
import { set } from '../../../../src/actions'

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
  expect(getItem('history').entries[0][0]).toEqual('/?hell=yea#yolo')

  expect(getItem('history')).toMatchSnapshot()
  expect(getLocation()).toMatchSnapshot()
})
