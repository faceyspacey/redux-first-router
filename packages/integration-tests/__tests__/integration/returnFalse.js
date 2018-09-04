import { confirm } from '@respond-framework/rudy/src/actions'
import createTest from '../../__helpers__/createTest'

createTest('beforeLeave return undefined', {
  FIRST: {
    path: '/first',
    beforeLeave() {},
  },
  SECOND: {
    path: '/second',
    thunk() {},
  },
})

createTest('beforeLeave return false', {
  FIRST: {
    path: '/first',
    beforeLeave: () => false,
  },
  SECOND: {
    path: '/second',
    thunk() {},
  },
})

createTest(
  'beforeLeave return false and user confirms action in modal',
  {
    FIRST: {
      path: '/first',
      beforeLeave: () => false,
    },
  },
  async ({ dispatch, getState }) => {
    await dispatch({ type: 'REDIRECTED' }) // not used as a redirect, but just an available default action type

    expect(getState()).toMatchSnapshot('action blocked')

    const res = await dispatch(confirm()) // user dispatches later in a modal (i.e. if a user confirmed the action)

    expect(res).toMatchSnapshot('response')
    expect(getState()).toMatchSnapshot('action confirmed')
  },
)

createTest(
  'beforeLeave return false and user chooses to stay in modal: confirm(false)',
  {
    FIRST: {
      path: '/first',
      beforeLeave: () => false,
    },
  },
  async ({ dispatch, getState }) => {
    await dispatch({ type: 'REDIRECTED' }) // not used as a redirect, but just an available default action type

    expect(getState()).toMatchSnapshot('action blocked')

    const res = await dispatch(confirm(false)) // user dispatches later in a modal (i.e. if a user confirmed the action)

    expect(res).toMatchSnapshot('response')
    expect(getState()).toMatchSnapshot('action confirmed')
  },
)

createTest(
  'beforeLeave return false and user confirms action in modal (with redirects in between)',
  {
    FIRST: {
      path: '/first',
      beforeLeave: () => false,
    },
    SECOND: {
      path: '/second',
      beforeEnter: async ({ dispatch }) => {
        await dispatch({ type: 'REDIRECTED' })
      },
    },
  },
  [],
  async ({ dispatch, getState }) => {
    await dispatch({ type: 'SECOND' })
    expect(getState()).toMatchSnapshot('action blocked')

    const res = await dispatch(confirm()) // user dispatches later in a modal (i.e. if a user confirmed the action)
    expect(res).toMatchSnapshot('response')
    expect(getState()).toMatchSnapshot('action confirmed')
  },
)

createTest(
  'beforeEnter return false and user confirms action in modal',
  {
    SECOND: {
      path: '/second',
      beforeEnter: () => false,
    },
  },
  [],
  async ({ dispatch, getState }) => {
    await dispatch({ type: 'SECOND' })
    expect(getState()).toMatchSnapshot('action blocked')

    const res = await dispatch(confirm()) // user dispatches later in a modal (i.e. if user confirmed entering a restricted portion of a site [e.g. over age 21])
    expect(res).toMatchSnapshot('response')
    expect(getState()).toMatchSnapshot('action confirmed')
  },
)

createTest('beforeEnter return false', {
  SECOND: {
    path: '/second',
    beforeEnter: () => false,
    thunk() {},
  },
})

createTest('thunk return false', {
  SECOND: {
    path: '/second',
    thunk: () => false,
    onComplete() {},
  },
})
