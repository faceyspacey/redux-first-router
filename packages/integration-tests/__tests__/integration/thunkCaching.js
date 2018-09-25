import { clearCache } from '@respond-framework/rudy/src/actions'
import createTest from '../../__helpers__/createTest'

createTest(
  'cached thunk only called once',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  [],
  async ({ snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })
    await snap({ type: 'SECOND' })
  },
)

createTest(
  'options.createCacheKey',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  {
    createCacheKey: (action, name) => action.type,
  },
  [],
  async ({ snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })
    await snap({ type: 'SECOND' })
  },
)

createTest(
  'cache.clear()',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  [],
  async ({ dispatch, snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })

    await dispatch(({ cache }) => {
      cache.clear()
    })

    await snap({ type: 'SECOND' })
  },
)

createTest(
  'cache.clear(string)',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  [],
  async ({ dispatch, snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })

    await dispatch(({ cache }) => {
      cache.clear('SECOND')
    })

    await snap({ type: 'SECOND' })
  },
)

createTest(
  'cache.clear(action)',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  [],
  async ({ dispatch, snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })

    await dispatch(({ cache }) => {
      cache.clear({ type: 'SECOND' })
    })

    await snap({ type: 'SECOND' })
  },
)

createTest(
  'cache.clear(action, { name: "thunk" })',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  [],
  async ({ dispatch, snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })

    await dispatch(({ cache }) => {
      cache.clear({ type: 'SECOND' }, { name: 'thunk' })
    })

    await snap({ type: 'SECOND' })
  },
)

createTest(
  'cache.clear(func)',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  [],
  async ({ dispatch, snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })

    await dispatch(({ cache }) => {
      cache.clear((cache, api, opts) => {
        for (const k in cache) delete cache[k]
      })
    })

    await snap({ type: 'SECOND' })

    await dispatch(({ cache }) => {
      cache.clear((cache, api, opts) => {
        for (const key in cache) delete cache[key]
      })
    })

    await snap({ type: 'FIRST' })

    await snap({ type: 'SECOND' })
  },
)

createTest(
  'clearCache(invalidator) - action creator',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  [],
  async ({ dispatch, snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })

    await dispatch(clearCache())

    await snap({ type: 'SECOND' })
  },
)

createTest(
  'route.cache === false',
  {
    SECOND: {
      path: '/second',
      cache: false,
      thunk() {},
    },
  },
  [],
  async ({ snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })
    await snap({ type: 'SECOND' })
  },
)

createTest(
  'options.cache === false',
  {
    SECOND: {
      path: '/second',
      thunk() {},
    },
  },
  {
    cache: false,
  },
  [],
  async ({ snap }) => {
    await snap({ type: 'SECOND' })
    await snap({ type: 'FIRST' })
    await snap({ type: 'SECOND' })
  },
)
