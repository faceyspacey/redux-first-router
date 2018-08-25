import createTest from '../../__helpers__/createTest'

createTest(
  'pathlessRoute + anonymousThunks can perform redirects in the pipeline',
  {
    SECOND: {
      path: '/second',
      autoDispatch: false,
      beforeEnter: () => 'foo',
      thunk: async ({ dispatch }) => {
        await dispatch({ type: 'PATHLESS_NOT_INTERPUTING' })
        await dispatch({ type: 'PATHLESS_A' })
      },
      onComplete: () => {},
    },
    PATHLESS_A: {
      thunk: async ({ dispatch }) => {
        await dispatch(async ({ dispatch }) =>
          // anonymousThunk
          dispatch({ type: 'PATHLESS_B' }),
        )
      },
    },
    PATHLESS_B: {
      thunk: async () => ({ type: 'REDIRECTED' }), // we'll reach here successfully in one pass through the pipeline
    },
    PATHLESS_NOT_INTERPUTING: {
      thunk: () => {},
    },
  },
  [{ type: 'SECOND' }],
)
