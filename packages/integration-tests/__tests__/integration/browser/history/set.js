import { locationToUrl } from '@respond-framework/rudy/src/utils'
import { set } from '@respond-framework/rudy/src/actions'
import createTest from '../../../../__helpers__/createTest'

createTest(
  'set(action)',
  {
    FIRST: '/:foo?',
  },
  {
    testBrowser: true,
    basenames: ['/base'],
  },
  [],
  async ({ snap }) => {
    const action = {
      query: { hell: 'yea' },
      hash: 'yolo',
      basename: 'base',
      state: { something: 123 },
    }

    await snap(set(action))
    expect(locationToUrl(window.location)).toEqual('/base/?hell=yea#yolo')

    // for good measure, test overwriting it and changing the path

    const action2 = {
      ...action,
      params: { foo: 'bar' },
      query: { hello: 'world', hell: undefined },
    }

    await snap(set(action2))
    expect(locationToUrl(window.location)).toEqual('/base/bar?hello=world#yolo')
  },
)
