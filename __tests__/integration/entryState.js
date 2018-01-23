import createTest from '../../__helpers__/createTest'

createTest('state attached to history entry', {
  SECOND: {
    path: '/second'
  }
}, [
  { type: 'SECOND', state: { foo: 'bar' } },
  { type: 'FIRST' },
  { type: 'SECOND', state: { baz: 'bla' } }
])

createTest('state merged on back/next', {
  SECOND: {
    path: '/second'
  }
}, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND', state: { foo: 'bar' } })
  await dispatch({ type: 'FIRST' })
  await snap({ type: 'SECOND', state: { baz: 'bla' } })
})

createTest('action.state as function', {
  SECOND: {
    path: '/second'
  }
}, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND', state: { foo: 'bar' } })
  await dispatch({ type: 'FIRST' })
  await snap({
    type: 'SECOND',
    state: (state) => ({
      foo: state.foo.toUpperCase(),
      baz: 'bla'
    })
  })
})
