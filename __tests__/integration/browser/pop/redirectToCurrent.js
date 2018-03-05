import createTest from '../../../../__helpers__/createTest'
import awaitUrlChange from '../../../../__helpers__/awaitUrlChange'

createTest('pop redirect to current URL', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    beforeEnter: async ({ prevRoute }) => {
      if (prevRoute.type !== 'THIRD') return
      await new Promise(res => setTimeout(res, 1))
      return { type: 'THIRD' }
    }
  },
  THIRD: '/third'
}, { browser: true }, [], async ({ snapPop, dispatch, getLocation }) => {
  await dispatch({ type: 'SECOND' })
  await dispatch({ type: 'THIRD' })

  await snapPop('back')
  await awaitUrlChange()
  expect(getLocation().type).toEqual('THIRD')
  expect(getLocation().index).toEqual(2)
  expect(getLocation().length).toEqual(3)

  expect(getLocation().entries[1].url).toEqual('/second')
  expect(getLocation().entries[2].url).toEqual('/third')

  expect(window.location.pathname).toEqual('/third')
})
