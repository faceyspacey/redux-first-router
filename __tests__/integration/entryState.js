import createTest from '../../__helpers__/createTest'

createTest('state attached to history entry', {
  SECOND: {
    path: '/second'
  }
}, [
  { type: 'SECOND', state: { foo: 'bar' } }
])

createTest('state merged on back/next', {
  SECOND: {
    path: '/second'
  }
}, [], async ({ dispatch, snap, getLocation }) => {
  await dispatch({ type: 'SECOND', state: { foo: 'bar' } })
  await dispatch({ type: 'FIRST' })
  await snap({ type: 'SECOND', state: { baz: 'bla' } })

  expect(getLocation()).toMatchSnapshot()
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

createTest('route.defaultState', {
  SECOND: {
    path: '/second',
    defaultState: { foo: 'bar' }
  },
  THIRD: {
    path: '/third',
    defaultState: q => {
      return { ...q, foo: 'bar' }
    }
  }
}, [
  { type: 'SECOND', state: { key: 'correct' } },
  { type: 'SECOND' }
], async ({ history, store, snapChange }) => {
  const res = await history.push('/third', { abc: 123 })
  snapChange(res, store, history)
})

createTest('route.toState/fromState', {
  SECOND: {
    path: '/second',
    toState: (v, k) => v.toUpperCase() + k.toUpperCase(),
    fromState: (v, k) => v.toLowerCase() + k.toLowerCase()
  },
  THIRD: {
    path: '/third',
    toState: (v, k) => v.toUpperCase() + k.toUpperCase(),
    fromState: (v, k) => v.toLowerCase() + k.toLowerCase()
  }
}, [
  { type: 'SECOND', state: { key: 'correct' } },
  { type: 'SECOND' }
], async ({ history, store, snapChange }) => {
  const res = await history.push('/third', { abc: 'XYZF' })
  snapChange(res, store, history)
})
