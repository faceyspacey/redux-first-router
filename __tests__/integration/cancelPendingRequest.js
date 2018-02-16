import createTest from '../../__helpers__/createTest'

createTest('new requests cancel current pending (not committed) requests', {
  FIRST: {
    path: '/first',
    beforeLeave: function(req) {
      if (req.type === 'THIRD') return
      return new Promise(res => setTimeout(res, 10))
    }
  },
  SECOND: {
    path: '/second',
    beforeEnter: function() {} // will not run because pipeline will be canceled
  },
  THIRD: {
    path: '/third',
    beforeEnter: function() {}
  }
}, [], async ({ dispatch, getLocation }) => {
  let res = dispatch({ type: 'SECOND' })
  await dispatch({ type: 'THIRD' })

  const state = getLocation()
  expect(state.type).toEqual('THIRD')

  res = await res
  expect(res).toEqual(false)

  expect(getLocation().type).toEqual('THIRD')
  expect(state).toEqual(getLocation())
})
