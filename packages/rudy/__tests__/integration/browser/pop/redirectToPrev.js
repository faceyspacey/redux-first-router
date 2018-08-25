import createTest from '../../../../__helpers__/createTest'

createTest(
  'pop redirect to prev URL',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: async ({ prevRoute, dispatch }) => {
        if (prevRoute.type !== 'THIRD') return
        await new Promise((res) => setTimeout(res, 1))
        return { type: 'FIRST' }
      },
    },
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snapPop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })
    await snapPop('back')

    expect(getLocation().type).toEqual('FIRST')
    expect(getLocation().index).toEqual(0)

    expect(getLocation().entries[0].location.url).toEqual('/')
    expect(getLocation().entries[1].location.url).toEqual('/second')

    expect(window.location.pathname).toEqual('/')
  },
)
