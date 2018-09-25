import createTest from '../../../../__helpers__/createTest'

createTest(
  'double pop',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => new Promise((res) => setTimeout(res, 30)),
    },
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snapPop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })

    const res = snapPop('back')
    setTimeout(() => window.history.back(), 10) // canceled
    await res

    expect(getLocation().type).toEqual('SECOND')
    expect(window.location.pathname).toEqual('/second')
  },
)
