import createTest from '../../../../__helpers__/createTest'
import { get } from '../../../../src/history/utils/sessionStorage'
import { locationToUrl } from '../../../../src/utils'
import { set } from '../../../../src/actions'


createTest('set(action)', {
  FIRST: '/:foo?'
}, {
  testBrowser: true,
  basenames: ['/base']
}, [], async ({ dispatch, getLocation }) => {
  const action = {
    query: { hell: 'yea' },
    hash: 'yolo',
    basename: '/base',
    state: { something: 123 }
  }
  await dispatch(set(action))

  expect(getLocation().hash).toEqual('yolo')
  expect(locationToUrl(window.location)).toEqual('/base/?hell=yea#yolo')
  expect(get().entries[0][0]).toEqual('/base/?hell=yea#yolo')

  expect(get()).toMatchSnapshot()
  expect(getLocation()).toMatchSnapshot()

  // for good measure, test overwriting it
  action.params = { foo: 'bar' }
  action.query = { hello: 'world', hell: undefined }
  await dispatch(set(action))

  expect(locationToUrl(window.location)).toEqual('/base/bar?hello=world#yolo')
  expect(get().entries[0][0]).toEqual('/base/bar?hello=world#yolo')

  expect(get()).toMatchSnapshot()
  expect(getLocation()).toMatchSnapshot()
})
