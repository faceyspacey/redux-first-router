import createTest from '../../__helpers__/createTest'
import { notFound } from '../../src/actions'

createTest('skip route actions with errors', {}, [
  { type: 'REDIRECTED', error: new Error('foo') }
])

