import createTest from '../../__helpers__/createTest'

test('anonymous thunks can be dispatched', async () => {
  const { store } = await createTest({
    SECOND: {
      path: '/second',
      beforeEnter: jest.fn(({ dispatch }) => {
        dispatch(({ dispatch }) => {
          dispatch({ type: 'REDIRECTED' })
        })
      })
    }
  })

  // test outside of route callbacks:
  const res = await store.dispatch(({ dispatch }) => {
    return dispatch({ type: 'FIRST' })
  })

  expect(res).toMatchSnapshot()
  expect(store.getState()).toMatchSnapshot()
})

test('anonymous thunks can return actions for automatic dispatch', async () => {
  const { store } = await createTest({
    THIRD: {
      path: '/third',
      beforeEnter: jest.fn(({ dispatch }) => {
        dispatch(() => ({ type: 'REDIRECTED' }))
      })
    }
  })

  // test outside of route callbacks:
  const res = await store.dispatch(({ dispatch }) => ({ type: 'FIRST' }))

  expect(res).toMatchSnapshot()
  expect(store.getState()).toMatchSnapshot()
})
