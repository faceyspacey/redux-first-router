import createTest from '../../../__helpers__/createTest'
import { notFound } from '../../../src/actions'

createTest('dispatch(notFound())', {}, [
  notFound()
])

createTest('dispatch(notFound(alternatePath))', {}, [
  notFound('/does-not-exist')
])

createTest('dispatch(notFound(alternatePath, basename, forcedType))', {}, [
  notFound('/does-not-exist', '/basename', 'WRONG')
])

createTest('dispatch(notFound(params))', {}, [
  notFound({ foo: 'bar' })
])

createTest('dispatch(notFound(action, alternatePath, basename))', {}, [
  notFound({ type: 'SECOND', params: { foo: 'bar' } }, '/does-not-exist', '/basename')
])

