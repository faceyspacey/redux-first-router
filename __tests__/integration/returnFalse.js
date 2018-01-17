import createTest from '../../__helpers__/createTest'

test('beforeLeave return false', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      beforeLeave: jest.fn(() => false)
    },
    SECOND: {
      path: '/second',
      thunk: jest.fn()
    }
  })
})

test('beforeLeave return undefined', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      beforeLeave: jest.fn()
    },
    THIRD: {
      path: '/third',
      thunk: jest.fn()
    }
  })
})

test('beforeEnter return false', async () => {
  await createTest({
    FOURTH: {
      path: '/fourth',
      beforeEnter: jest.fn(() => false),
      thunk: jest.fn()
    }
  })
})

test('thunk return false', async () => {
  await createTest({
    FIFTH: {
      path: '/fifth',
      thunk: jest.fn(() => false),
      onComplete: jest.fn()
    }
  })
})
