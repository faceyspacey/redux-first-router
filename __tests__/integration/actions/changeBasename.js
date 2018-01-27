import createTest from '../../../__helpers__/createTest'
import { changeBasename } from '../../../src/actions'

createTest('dispatch(changeBasename(name))', {}, {
  basenames: ['/foo']
}, [
  changeBasename('/foo')
])

createTest('dispatch(changeBasename(name, action))', {}, {
  basenames: ['/foo']
}, [
  changeBasename('/foo', { type: 'REDIRECTED' })
])

createTest('dispatch(changeBasename(name)) with existing basename', {}, {
  basenames: ['/foo', '/bar']
}, [
  '/foo/first',
  changeBasename('/bar')
])
