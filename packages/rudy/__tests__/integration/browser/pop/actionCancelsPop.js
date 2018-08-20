import createTest from '../../../../__helpers__/createTest'
import awaitUrlChange from '../../../../__helpers__/awaitUrlChange'

createTest(
  'pop then regular action (cancel pop)',
  {
    FIRST: '/',
    SECOND: {
      path: '/second',
      beforeEnter: () => new Promise((res) => setTimeout(res, 70)),
    },
    THIRD: '/third',
  },
  { testBrowser: true },
  [],
  async ({ snap, pop, dispatch, getLocation }) => {
    await dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })

    expect(window.location.pathname).toEqual('/third')

    pop('back') // canceled
    await awaitUrlChange()

    await snap({ type: 'FIRST' }) // cancels "back to SECOND"

    expect(getLocation().type).toEqual('FIRST')
    expect(getLocation().index).toEqual(3) // would otherwise equal 0 due to automatic back/next handling
    expect(getLocation().length).toEqual(4) // would otherwise be 3
    expect(window.location.pathname).toEqual('/')

    // now let's test the real hidden browser history track to make sure it matches what we expect!!!!:
    await pop('back')
    expect(window.location.pathname).toEqual('/third')

    await pop('back')
    expect(window.location.pathname).toEqual('/second')

    await pop('back')
    expect(window.location.pathname).toEqual('/')
  },
)
