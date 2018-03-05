import createTest from '../../../../__helpers__/createTest'
import awaitUrlChange from '../../../../__helpers__/awaitUrlChange'

createTest('pop then regular action (cancel pop)', {
  FIRST: '/',
  SECOND: {
    path: '/second',
    beforeEnter: () => new Promise(res => setTimeout(res, 50))
  },
  THIRD: '/third'
}, { browser: true }, [], async ({ snapPop, snap, dispatch, getLocation }) => {
  await dispatch({ type: 'SECOND' })
  await dispatch({ type: 'THIRD' })

  snapPop('back') // canceled
  await awaitUrlChange()
  await snap({ type: 'FIRST' })

  expect(getLocation().type).toEqual('FIRST')
  expect(getLocation().index).toEqual(3) // would otherwise equal 0 due to automatic back/next handling
  expect(window.location.pathname).toEqual('/')
})
