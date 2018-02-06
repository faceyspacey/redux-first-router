import createTest from '../../../__helpers__/createTest'
import { notFound } from '../../../src/actions'

createTest('dispatch(notFound())', {}, [
  notFound()
])

createTest('dispatch(notFound(alternatePath))', {}, [
  notFound('/does-not-exist')
])

createTest('dispatch(notFound(alternatePath, forcedType))', {}, [
  notFound('/does-not-exist', 'WRONG')
])

createTest('dispatch(notFound(params))', {}, [
  notFound({ foo: 'bar' })
])

createTest('dispatch(notFound(action, alternatePath))', {}, [
  notFound({ type: 'SECOND', params: { foo: 'bar' } }, '/does-not-exist')
])

createTest('notFound on first load', {}, [
  '/non-existent'
])
