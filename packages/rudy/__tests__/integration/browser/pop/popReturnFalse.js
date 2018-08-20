import createTest from '../../../../__helpers__/createTest'
import awaitUrlChange from '../../../../__helpers__/awaitUrlChange'

createTest(
  'pop from route that wont let you leave',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeLeave: () => false,
    },
  },
  { testBrowser: true },
  [],
  async ({ snapPop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    const res = await snapPop('back')
    console.log(res)
    await awaitUrlChange()

    expect(getLocation().type).toEqual('SECOND')
    expect(window.location.pathname).toEqual('/second')
  },
)
