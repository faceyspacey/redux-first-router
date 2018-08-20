import createTest from '../../__helpers__/createTest'
import fakeAsyncWork from '../../__helpers__/fakeAsyncWork'

createTest('callbacks sequentially run as promises', {
  SECOND: {
    path: '/second',
    beforeEnter: async () => {
      await fakeAsyncWork()
    },
    thunk: async () => {
      await fakeAsyncWork()
    },
    onComplete: async () => {
      await fakeAsyncWork()
      return 'payload'
    },
  },
})

createTest('callbacks sequentially run as promises /w redirect', {
  SECOND: {
    path: '/second',
    beforeEnter: async () => {
      await fakeAsyncWork()
    },
    thunk: async ({ action }) => {
      await fakeAsyncWork()
      if (action.type !== 'SECOND') return
      return { type: 'REDIRECTED' }
    },
    onComplete: async () => {
      await fakeAsyncWork()
    },
  },
})
