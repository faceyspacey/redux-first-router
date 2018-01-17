import createTest from '../../__helpers__/createTest'
import fakeAsyncWork from '../../__helpers__/fakeAsyncWork'

test('callbacks sequentially run as promises', async () => {
  await createTest({
    SECOND: {
      path: '/second',
      beforeEnter: jest.fn(async () => {
        await fakeAsyncWork()
      }),
      thunk: jest.fn(async () => {
        await fakeAsyncWork()
      }),
      onComplete: jest.fn(async () => {
        await fakeAsyncWork()
        return 'payload'
      })
    }
  })
})

test('callbacks sequentially run as promises /w redirect', async () => {
  await createTest({
    THIRD: {
      path: '/third',
      beforeEnter: jest.fn(async () => {
        await fakeAsyncWork()
      }),
      thunk: jest.fn(async ({ action }) => {
        await fakeAsyncWork()
        if (action.type !== 'THIRD') return
        return { type: 'REDIRECTED' }
      }),
      onComplete: jest.fn(async () => {
        await fakeAsyncWork()
      })
    }
  })
})
