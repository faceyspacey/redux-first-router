import createTest from '../../__helpers__/createTest'

createTest('callback "bag" argument has all goodies', {
  SECOND: {
    path: '/second',
    beforeEnter: (bag) => expect(bag).toMatchSnapshot('bag')
  }
})
