import createTest from '../../../../__helpers__/createTest'

createTest(
  'pop back then forward',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => new Promise((res) => setTimeout(res, 120)),
    },
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snapPop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })

    const mainPop = snapPop('back')

    setTimeout(() => window.history.back(), 10)
    setTimeout(() => window.history.forward(), 20)

    // and a few more for good measure (all should be blocked until the initial pop completes)
    setTimeout(() => window.history.forward(), 30)
    setTimeout(() => window.history.back(), 40)

    await mainPop
    expect(getLocation().type).toEqual('SECOND')
    expect(window.location.pathname).toEqual('/second')
  },
)
