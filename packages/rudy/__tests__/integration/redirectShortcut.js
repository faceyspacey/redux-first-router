import createTest from '../../__helpers__/createTest'

createTest('redirect to type specified as redirect route option value', {
  SECOND: {
    path: '/second',
    redirect: 'REDIRECTED',
  },
})

createTest(
  'redirect shortcut /w params passed on',
  {
    SECOND: {
      path: '/second/:param',
      redirect: 'REDIRECTED',
    },
    REDIRECTED: {
      path: '/redirected/:param',
      onComplete: () => 'redirect_complete',
    },
  },
  [{ type: 'SECOND', params: { param: 'foo' } }],
)
