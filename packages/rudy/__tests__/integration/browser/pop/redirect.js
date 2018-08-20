import createTest from '../../../../__helpers__/createTest'

createTest(
  'pop redirect',
  {
    FIRST: {
      path: '/',
      beforeEnter: async ({ location }) => {
        if (location.kind === 'load') return
        await new Promise((res) => setTimeout(res, 1))
        return { type: 'THIRD' }
      },
    },
    SECOND: '/second',
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snapPop, pop, dispatch, getState, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    await snapPop('back')

    expect(getLocation().type).toEqual('THIRD')
    expect(getLocation().entries[0].location.url).toEqual('/third')

    expect(window.location.pathname).toEqual('/third')
    expect(getLocation().type).toEqual('THIRD')
  },
)
