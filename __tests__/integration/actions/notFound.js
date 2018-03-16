import createTest from '../../../__helpers__/createTest'
import { notFound } from '../../../src/actions'

createTest('dispatch(notFound())', {}, [
  notFound()
])

createTest('notFound on first load', {}, [
  '/non-existent'
])

createTest('dispatch(notFound(state))', {}, [
  notFound({ foo: 'bar' })
])

createTest('dispatch(notFound(state, forcedType))', {
  'scene/NOT_FOUND': {
    path: '/scene-level-not-found'
  }
}, [
  notFound({ foo: 'bar' }, 'scene/NOT_FOUND') // createScene passes an alternate NOT_FOUND type
])
