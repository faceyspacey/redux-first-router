import createTest from '../../__helpers__/createTest'

createTest('beforeLeave return false', {
  FIRST: {
    path: '/first',
    beforeLeave: ({ dispatch, action }) => false
  },
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
})

let confirmModal

createTest('beforeLeave return false and user confirms action in modal', {
  FIRST: {
    path: '/first',
    beforeLeave: ({ dispatch, action }) => {
      confirmModal = () => dispatch({ ...action, params: { canLeave: true } })

      return !!action.params.canLeave // a real app can do anything to determine if the user can leave (e.g. check if a purchase form is complete)
    }
  }
}, async ({ dispatch, getState }) => {
  await dispatch({ type: 'REDIRECTED' }) // not used as a redirect, but just an available default action type
  expect(getState()).toMatchSnapshot('action blocked')

  const res = await confirmModal() // user dispatches later in a modal (i.e. if a user confirmed the action)
  expect(res).toMatchSnapshot()
  expect(getState()).toMatchSnapshot('action confirmed')
})

createTest('beforeLeave return undefined', {
  FIRST: {
    path: '/first',
    beforeLeave: function() {}
  },
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
})

createTest('beforeEnter return false', {
  SECOND: {
    path: '/second',
    beforeEnter: () => false,
    thunk: function() {}
  }
})

createTest('thunk return false', {
  SECOND: {
    path: '/second',
    thunk: () => false,
    onComplete: function() {}
  }
})
