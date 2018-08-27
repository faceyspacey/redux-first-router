import { notFound } from '@respond-framework/rudy/src/actions'
import createScene from '@respond-framework/rudy/src/createScene'
import createTest from '../../../__helpers__/createTest'

createTest('dispatch(notFound())', {}, [notFound()])

createTest('notFound on first load', {}, ['/non-existent'])

createTest('dispatch(notFound(state))', {}, [notFound({ foo: 'bar' })])

const { routes } = createScene(
  {
    NOT_FOUND: {
      path: '/scene-level-not-found',
    },
  },
  { scene: 'scene' },
)

createTest('dispatch(notFound(state, forcedType))', routes, [
  notFound({ foo: 'bar' }, 'scene/NOT_FOUND'), // createScene passes an alternate NOT_FOUND type
])
