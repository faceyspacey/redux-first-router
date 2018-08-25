import createTest from '../../__helpers__/createTest'

createTest(
  'state attached to history entry',
  {
    SECOND: {
      path: '/second',
    },
  },
  [{ type: 'SECOND', state: { foo: 'bar' } }],
)

createTest(
  'state merged on back/next',
  {
    SECOND: {
      path: '/second',
    },
  },
  [],
  async ({ dispatch, snap, getLocation }) => {
    await dispatch({ type: 'SECOND', state: { foo: 'bar' } })
    await dispatch({ type: 'FIRST' })
    await snap({ type: 'SECOND', state: { baz: 'bla' } })

    expect(getLocation()).toMatchSnapshot()
  },
)

createTest(
  'action.state as function',
  {
    SECOND: {
      path: '/second',
    },
  },
  [],
  async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND', state: { foo: 'bar' } })
    await dispatch({ type: 'FIRST' })
    await snap({
      type: 'SECOND',
      state: (state) => ({
        foo: state.foo.toUpperCase(),
        baz: 'bla',
      }),
    })
  },
)

createTest(
  'route.defaultState',
  {
    SECOND: {
      path: '/second',
      defaultState: { foo: 'bar' },
    },
    THIRD: {
      path: '/third',
      defaultState: (q) => ({ ...q, foo: 'bar' }),
    },
  },
  [{ type: 'SECOND', state: { key: 'correct' } }, { type: 'SECOND' }],
  async ({ history, snapChange }) => {
    const res = await history.push('/third', { abc: 123 })
    snapChange(res)
  },
)
