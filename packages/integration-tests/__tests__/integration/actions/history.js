import {
  push,
  replace,
  jump,
  back,
  next,
  reset,
  set,
  setParams,
  setQuery,
  setState,
  setHash,
  setBasename,
  redirect,
} from '@respond-framework/rudy/src/actions'
import createTest from '../../../__helpers__/createTest'

const routes = {
  FIRST: {
    path: '/first/:foo?',
  },
  SECOND: '/second',
  THIRD: '/third',
  FOURTH: '/fourth',
}

createTest('dispatch(push/replace())', routes, [
  ['dispatch(push(path))', push('/second')],
  ['dispatch(push(path, state))', push('/second', { foo: 'bar' })],
  ['dispatch(replace(path))', replace('/second')],
  ['dispatch(replace(path, state))', replace('/second', { foo: 'bar' })],
])

createTest('dispatch(back/next())', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })

  await snap(back({ foo: 'bar' }))
  await snap(next({ yo: 'dog' }))
  await snap(back(() => ({ more: 'state' })))
  await snap(next({ bla: 'sdf' })) // merge states
  await snap(back())
})

createTest(
  'automatically interpret push to previous entry as a kind === "back"',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap({ type: 'FIRST' })
  },
)

createTest(
  'automatically interpret push to next entry as a kind === "next"',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'FIRST' })
    await snap({ type: 'SECOND' })
  },
)

createTest(
  'automatically interpret replace to previous entry as a kind === "back"',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap(redirect({ type: 'FIRST' }))
  },
)

createTest(
  'automatically interpret replace to next entry as a kind === "next"',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'FIRST' })
    await snap(redirect({ type: 'SECOND' }))
  },
)

createTest('dispatch(jump(n))', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })

  await dispatch(({ history }) => {
    expect(history.canJump(-1)).toEqual(true)
    expect(history.canJump(1)).toEqual(false)
  })

  await snap(jump(-1))

  // await dispatch(({ history }) => {
  //   expect(history.canJump(1)).toEqual(true)
  //   expect(history.canJump(-1)).toEqual(false)
  // })

  // await snap(jump(1))
})

createTest(
  'dispatch(jump(n, byIndex === true, act))',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap(jump(0, true, undefined, { state: { foo: 'bar' } }))
    await snap(jump(1, true, undefined, { state: { foo: 'bar' } }))
  },
)

// you can force the kind to be whatever you want,
// which will presume the user came from a different direction;
// otherwise it's automatically inferred
createTest(
  'dispatch(jump(n, byIndex, n, state))',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })

    await snap(jump(0, true, 1, { state: { foo: 'bar' } })) // would normally be "back"
    await snap(jump(2, true, -1, { state: { foo: 'bar' } })) // would normally be "next"
  },
)

// when you jump more than one entry, middleware/transformAction/utils/historyAction.js re-creates `state.location.prev`
createTest('dispatch(jump(-2))', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })
  await dispatch({ type: 'THIRD' })

  await snap(jump(-2))
})

createTest(
  'dispatch(reset(entries)) - last element inferred, n 1 inferred',
  routes,
  [reset(['/second', '/third'])],
)

createTest('dispatch(reset(entries, index)) - n 1 inferred)', routes, [
  reset(['/second', '/third'], 1),
])

createTest(
  'dispatch(reset(entries, index)) - redirect kind inferred (because prev and current index is the same)',
  routes,
  [reset(['/second', '/third'], 0)],
)

createTest(
  'dispatch(reset(entries, index)) - load kind inferred (because only one entry)',
  routes,
  [reset(['/second'])],
)

createTest('dispatch(reset(entries, index, n)) - n -1 faked)', routes, [
  reset(['/second', '/third', '/fourth'], 1, -1),
])

createTest('dispatch(reset(entries, index, n)) - n 1 faked)', routes, [
  reset(['/second', '/third', '/fourth'], 1, 1),
])

createTest(
  'dispatch(reset(entries, index)) - n -1 inferred',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap(reset(['/second', '/third'], 0))
  },
)

createTest(
  'dispatch(reset(entries, index)) - n 1 inferred because > than current index',
  routes,
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap(reset(['/fourth', '/second', '/third', '/first'], 2))
  },
)

createTest(
  'dispatch(reset(actions)) - entries as action objects',
  routes,
  {
    basenames: ['/base-name'],
  },
  [
    reset([
      {
        type: 'SECOND',
        state: { bla: 'sdf' },
      },
      {
        type: 'THIRD',
        basename: '/base-name',
        state: { abc: 'def' },
        hash: 'something',
        query: { foo: 'bar', baz: 'yo' },
      },
    ]),
  ],
)

createTest(
  'dispatch(reset(actions)) - entries as arrays [url, state]',
  routes,
  {
    basenames: ['/base-name'],
  },
  [
    reset([
      ['/second', { bla: 'sdf' }],
      ['/base-name/third?foo=bar&baz=yo#something', { abc: 'def' }],
    ]),
  ],
)

// SET

describe('dispatch(set())', () => {
  createTest('dispatch(set(action))', routes, [
    set({ params: { foo: 'bar' }, hash: 'yolo' }),
  ])

  createTest('dispatch(set(func))', routes, [
    set((action) => ({ ...action, query: { foo: 'bar' }, hash: 'yolo' })),
  ])

  createTest(
    'dispatch(set(action, n))',
    routes,
    [],
    async ({ dispatch, snap }) => {
      await dispatch({ type: 'SECOND' })
      await snap(set({ state: { foo: 'bar' } }, -1)) // n is the relative entry index number
    },
  )

  createTest(
    'dispatch(set(action, keyString))',
    routes,
    [],
    async ({ dispatch, snap }) => {
      await dispatch({ type: 'SECOND' })
      await snap(set({ hash: 'bar' }, '345678')) // all keys are '345678' but `entries.findIndex` finds the FIRST entry
    },
  )

  createTest(
    'dispatch(set(action, index, byIndex === true))',
    routes,
    {
      basenames: ['/bar'],
    },
    [],
    async ({ dispatch, snap }) => {
      await dispatch({ type: 'SECOND' })
      await snap(set({ basename: '/bar' }, 0, true)) // index is the actual entry index number
    },
  )
})

describe('dispatch(setParams())', () => {
  createTest('dispatch(setParams(params))', routes, [setParams({ foo: 'bar' })])

  createTest('dispatch(setParams(func))', routes, [
    setParams((params) => ({ ...params, foo: 'bar' })),
  ])
})

describe('dispatch(setQuery())', () => {
  createTest('dispatch(setQuery(query))', routes, [setQuery({ foo: 'bar' })])

  createTest('dispatch(setQuery(func))', routes, [
    setQuery((query) => ({ ...query, foo: 'bar' })),
  ])
})

describe('dispatch(setState())', () => {
  createTest('dispatch(setState(state))', routes, [setState({ foo: 'bar' })])

  createTest('dispatch(setState(func))', routes, [
    setState((state) => ({ ...state, foo: 'bar' })),
  ])
})

describe('dispatch(setHash())', () => {
  createTest('dispatch(setHash(setHash))', routes, [setHash('new-hash')])

  createTest('dispatch(setHash(func))', routes, [setHash((hash) => 'new-hash')])
})

describe('dispatch(setBasename())', () => {
  createTest(
    'dispatch(setBasename(basename))',
    routes,
    {
      basenames: ['/new-basename'],
    },
    [setBasename('/new-basename')],
  )

  createTest(
    'dispatch(setBasename(func))',
    routes,
    {
      basenames: ['new-basename'],
    },
    [setBasename((basename) => 'new-basename')],
  )
})
