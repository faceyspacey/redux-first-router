import createTest from '../../../../__helpers__/createTest'

createTest(
  'pop',
  {
    FIRST: '/',
    SECOND: '/second',
  },
  { testBrowser: true },
  [],
  async ({ snapPop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    await snapPop('back')

    expect(getLocation().type).toEqual('FIRST')
    expect(window.location.pathname).toEqual('/')
  },
)
