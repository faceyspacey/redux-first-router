import createTest from '../../__helpers__/createTest'

createTest('do NOT dispatch actions with identical URLs more than once', {
  SECOND: {
    path: '/second/:param',
    beforeEnter: function() {}
  }
}, [], async ({ history, snap }) => {
  await snap({ type: 'SECOND', params: { param: 'foo' }, query: { foo: 'bar' }, hash: 'bla' })
  await snap({ type: 'SECOND', params: { param: 'foo' }, query: { foo: 'bar' }, hash: 'bla' })
  await snap(() => history.push('/second/foo?foo=bar#bla'))
})
