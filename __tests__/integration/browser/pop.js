import createTest from '../../../__helpers__/createTest'

createTest('pop test', {
  FIRST: {
    path: '/'
  },
  SECOND: {
    path: '/second'
  }
}, { browser: true }, [], async ({ snapPop, awaitPop, dispatch, getState, getLocation }) => {
  await dispatch({ type: 'SECOND' })
  let res

  res = await snapPop('back')
  expect(getLocation().type).toEqual('FIRST')

  res = await awaitPop('forward')

  console.log('RES', getLocation())
})
