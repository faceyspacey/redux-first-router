import createTest from '../../../../__helpers__/createTest'

createTest(
  'regular action then pop (cancel regular action)',
  {
    FIRST: {
      path: '/',
      beforeEnter: () => new Promise((res) => setTimeout(res, 50)),
    },
    SECOND: '/second',
    THIRD: {
      path: '/third',
      beforeEnter: () => new Promise((res) => setTimeout(res, 50)),
    },
  },
  { testBrowser: true },
  [],
  async ({ snapPop, pop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    expect(window.location.pathname).toEqual('/second')

    const third = dispatch({ type: 'THIRD' }) // canceled
    await new Promise((res) => setTimeout(res, 10)) // let the previous action get to `beforeEnter` callback (since we did not await it)
    const res = pop('back')

    setTimeout(() => window.history.forward(), 15) // let's also check to make sure these are blocked during transition to FIRST
    setTimeout(() => window.history.back(), 20)
    setTimeout(() => window.history.forward(), 25)

    await Promise.all([res, third])

    expect(getLocation().type).toEqual('FIRST')
    expect(getLocation().index).toEqual(0) // would otherwise equal 0
    expect(window.location.pathname).toEqual('/')
  },
)
