import createTest from '../../__helpers__/createTest'

// true is the default by the way
createTest(
  'firstRoute(true) resolves early on enter',
  {
    FIRST: {
      path: '/first',
      beforeEnter: () => 'beforeEnterComplete',
      thunk: async () => {
        await new Promise((res) => setTimeout(res, 5))
        return 'notAwaited'
      },
    },
  },
  {
    dispatchFirstRoute: false, // but tests are setup to pass `true` without this option (note: this option only exists in tests)
  },
  [],
  async ({ firstRoute, dispatch, getState }) => {
    const res = await dispatch(firstRoute()) // by default creatTest dispatches: firstRoute(false), going through the whole pipeline

    expect(res.type).toEqual('FIRST')
    expect(getState().title).toEqual('FIRST') // would otherwise equal: FIRST_COMPLETE - "notAwaited"

    expect(res).toMatchSnapshot('response')
    expect(getState()).toMatchSnapshot('state')
  },
)
