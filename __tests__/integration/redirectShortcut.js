import createTest from '../../__helpers__/createTest'

test('redirect to type specified as redirect route option value', async () => {
  await createTest({
    SECOND: {
      path: '/second',
      redirect: 'REDIRECTED'
    }
  })
})


test('redirect shortcut /w params', async () => {
  await createTest({
    THIRD: {
      path: '/third/:param',
      redirect: 'REDIRECTED'
    },
    REDIRECTED: {
      path: '/redirected/:param',
      onComplete: jest.fn(() => 'redirect_complete')
    }
  }, [
    { type: 'THIRD', params: { param: 'foo' } }
  ])
})
