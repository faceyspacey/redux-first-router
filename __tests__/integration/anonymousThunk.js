import createTest from '../../__helpers__/createTest'

createTest('anonymous thunks can be dispatched', {
  SECOND: {
    path: '/second',
    beforeEnter: async ({ dispatch, getLocation }) => {
      await dispatch(({ dispatch }) => {
        // return { type: 'REDIRECTED' }
        dispatch({ type: 'REDIRECTED' })
      })
    }
    // onComplete({ getLocation }) {
    //   console.log('YES2', getLocation().type)
    // }
  }
})

// createTest('anonymous thunks can be dispatched', {
//   FOO: {
//     thunk: async ({ dispatch }) => {
//       // dispatch({ type: 'REDIRECTED' })

//       await dispatch(async ({ dispatch }) => {
//         // return { type: 'REDIRECTED' }
//         await dispatch({ type: 'BAR' })
//       })
//     }
//   },
//   BAR: {
//     thunk: async ({ dispatch }) => {
//       // dispatch({ type: 'REDIRECTED' })

//       await dispatch(({ dispatch }) => {
//         // return { type: 'REDIRECTED' }
//         return dispatch({ type: 'REDIRECTED' })
//       })
//     }
//   },
//   SECOND: {
//     path: '/second',
//     beforeEnter: async ({ dispatch, getLocation }) => {
//       return { type: 'FOO' }
//     }
//     // onComplete({ getLocation }) {
//     //   console.log('YES2', getLocation().type)
//     // }
//   }
// }, [
//   { type: 'SECOND' }
// ])

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
