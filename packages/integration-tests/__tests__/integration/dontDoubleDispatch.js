import createTest from '../../__helpers__/createTest'

createTest(
  'do NOT dispatch actions with identical URLs more than once',
  {
    SECOND: {
      path: '/second/:param',
      beforeEnter() {},
    },
  },
  [],
  async ({ history, snap, getState, dispatch }) => {
    await snap({
      type: 'SECOND',
      params: { param: 'foo' },
      query: { foo: 'bar' },
      hash: 'bla',
    })
    await snap({
      type: 'SECOND',
      params: { param: 'foo' },
      query: { foo: 'bar' },
      hash: 'bla',
    })

    const state = getState()
    const res = await history.push('/second/foo?foo=bar#bla')
    expect(res).toMatchSnapshot()
    expect(state).toEqual(getState())

    await dispatch(({ routes }) => {
      expect(routes.SECOND.beforeEnter).toHaveBeenCalledTimes(1)
    })
  },
)

createTest(
  'allow double dispatch when kind === "load"',
  {
    FIRST: {
      path: '/first',
      beforeEnter() {},
    },
  },
  [{ type: 'FIRST' }],
)
