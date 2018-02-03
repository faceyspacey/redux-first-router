import createTest from '../../__helpers__/createTest'

// createTest('anonymous thunks can be dispatched', {
//   SECOND: {
//     path: '/second',
//     beforeEnter: ({ dispatch }) => {
//       dispatch(({ dispatch }) => {
//         dispatch({ type: 'REDIRECTED' })
//       })
//     }
//   }
// }, async ({ dispatch, getState }) => {
//   // test outside of route callbacks:
//   const res = await dispatch(({ dispatch }) => {
//     return dispatch({ type: 'FIRST' })
//   })

//   expect(res).toMatchSnapshot()
//   expect(getState()).toMatchSnapshot()
// })

// createTest('anonymous thunks can return actions for automatic dispatch', {
//   SECOND: {
//     path: '/second',
//     beforeEnter: ({ dispatch }) => {
//       dispatch(() => ({ type: 'REDIRECTED' }))
//     }
//   }
// }, async ({ dispatch, getState }) => {
//   // test outside of route callbacks:
//   const res = await dispatch(() => ({ type: 'FIRST' }))

//   expect(res).toMatchSnapshot()
//   expect(getState()).toMatchSnapshot()
// })
