import createTest from '../../../../__helpers__/createTest'

createTest(
  'double pop (when 4th index same as prev)',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => new Promise((res) => setTimeout(res, 30)),
    },
    THIRD: '/third',
    FOURTH: '/fourth',
  },
  { testBrowser: true },
  [],
  async ({ pop, snapPop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })
    await dispatch({ type: 'FIRST' }) // HERE'S WHAT WE ARE TESTING
    // We had an old algorithm in `BrowserHistory._setupPopHandling` that would
    // be problematic if the prev route and 2 routes forward were the same.
    // The algo has been replaced with a solid one without this problem,
    // but we'll keep the test.

    await pop('back')
    const res = snapPop('back')
    setTimeout(() => window.history.back(), 10) // canceled (prev route is now FIRST)
    await res

    expect(getLocation().type).toEqual('SECOND')
    expect(window.location.pathname).toEqual('/second')
  },
)
