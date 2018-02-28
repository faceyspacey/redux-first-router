import createTest from '../../../__helpers__/createTest'
import {
  push,
  replace,
  setState,
  jump,
  back,
  next,
  reset
} from '../../../src/actions'

const routes = {
  SECOND: '/second',
  THIRD: '/third',
  FOURTH: '/fourth'
}

createTest('dispatch(push/replace())', routes, [
  ['dispatch(push(path))', push('/second')],
  ['dispatch(push(path, state))', push('/second', { foo: 'bar' })],
  ['dispatch(replace(path))', replace('/second')],
  ['dispatch(replace(path, state))', replace('/second', { foo: 'bar' })]
])

describe('dispatch(setState())', () => {
  createTest('dispatch(setState(state))', routes, [
    setState({ foo: 'bar' })
  ])

  createTest('dispatch(setState(stateFunc))', routes, [
    setState(state => ({ ...state, foo: 'bar' }))
  ])

  createTest('dispatch(setState(state, n))', routes, [], async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap(setState({ foo: 'bar' }, -1)) // n is the relative entry index number
  })

  createTest('dispatch(setState(state, keyString))', routes, [], async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap(setState({ foo: 'bar' }, '345678')) // all keys are '345678' but `entries.findIndex` finds the FIRST entry
  })

  createTest('dispatch(setState(state, index, byIndex === true))', routes, [], async ({ dispatch, snap }) => {
    await dispatch({ type: 'SECOND' })
    await snap(setState({ foo: 'bar' }, 0, true)) // index is the actual entry index number
  })
})

createTest('dispatch(back/next())', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })

  await snap(back({ foo: 'bar' }))
  await snap(next({ yo: 'dog' }))
  await snap(back(() => ({ clear: 'old state' }))) // if you want to clear state, use the function form without merging prev state
  await snap(next({ bla: 'sdf' })) // merge states
  await snap(back())
})

createTest('automatically interpret push to previous entry as a kind === "back"', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })
  await snap({ type: 'FIRST' })
})

createTest('automatically interpret push to next entry as a kind === "next"', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })
  await dispatch({ type: 'FIRST' })
  await snap({ type: 'SECOND' })
})

createTest('dispatch(jump(n))', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })

  await dispatch(({ history }) => {
    expect(history.canJump(-1)).toEqual(true)
    expect(history.canJump(1)).toEqual(false)
  })

  await snap(jump(-1))

  await dispatch(({ history }) => {
    expect(history.canJump(1)).toEqual(true)
    expect(history.canJump(-1)).toEqual(false)
  })

  await snap(jump(1))
})

createTest('dispatch(jump(n, state, byIndex === true))', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })
  await snap(jump(0, { foo: 'bar' }, true))
  await snap(jump(1, { foo: 'bar' }, true))
})

// you can force the kind to be whatever you want,
// which will presume the user came from a different direction;
// otherwise it's automatically inferred
createTest('dispatch(jump(n, state, byIndex, kind))', routes, [], async ({ dispatch, snap, getLocation }) => {
  await dispatch({ type: 'SECOND' })
  await dispatch({ type: 'THIRD' })

  await snap(jump(0, { foo: 'bar' }, true, 'next')) // would normally be "back"
  console.log(getLocation())
  await snap(jump(2, { foo: 'bar' }, true, 'back')) // would normally be "next"
  console.log(getLocation())
})

// when you jump more than one entry, middleware/transformAction/utils/historyAction.js re-creates `state.location.prev`
createTest('dispatch(jump(-2))', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })
  await dispatch({ type: 'THIRD' })

  await snap(jump(-2))
})

createTest('dispatch(reset(entries)) - last element inferred, next kind inferred', routes, [
  reset(['/second', '/third'])
])

createTest('dispatch(reset(entries, index)) - next kind inferred)', routes, [
  reset(['/second', '/third'], 1)
])

createTest('dispatch(reset(entries, index)) - redirect kind inferred (because prev and current index is the same)', routes, [
  reset(['/second', '/third'], 0)
])

createTest('dispatch(reset(entries, index)) - load kind inferred (because only one entry)', routes, [
  reset(['/second'])
])

createTest('dispatch(reset(entries, index)) - kind kind forced)', routes, [
  reset(['/second', '/third', '/fourth'], 1, 'back')
])

createTest('dispatch(reset(entries, index)) - back kind inferred', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })
  await snap(reset(['/second', '/third'], 0))
})

createTest('dispatch(reset(entries, index)) - next kind inferred because > than current index', routes, [], async ({ dispatch, snap }) => {
  await dispatch({ type: 'SECOND' })
  await snap(reset(['/fourth', '/second', '/third', '/first'], 2))
})

createTest('dispatch(reset(entryObjects)) - entries as location objects', routes, [
  reset([{
    basename: '/first-base',
    hash: '',
    key: '123456',
    pathname: '/second',
    search: '',
    state: { bla: 'sdf' },
    url: '/second'
  }, {
    basename: '/base-name',
    hash: 'something',
    key: '345678',
    pathname: '/third',
    search: 'foo=bar&baz=yo',
    state: {},
    url: '/third?foo=bar&baz=yo'
  }])
])

createTest('dispatch(reset(actions)) - entries as action objects', routes, [
  reset([{
    type: 'SECOND',
    basename: '/first-base',
    state: { bla: 'sdf' }
  }, {
    type: 'THIRD',
    basename: '/base-name',
    hash: 'something',
    query: { foo: 'bar', baz: 'yo' }
  }])
])
