import createTest from '../../__helpers__/createTest'

createTest('callback can be array of functions', {
  FIRST: {
    path: '/first',
    thunk: [
      (req) => {
        req.passOn = 'a'
      },
      (req) => {
        req.passOn += 'b'
      },
      (req) => `${req.passOn}c`,
    ],
  },
})

createTest('callback can be array of inherited callbacks', {
  FIRST: {
    path: '/first',
    thunk: [
      (req) => {
        req.passOn = 'a'
      },
      'REDIRECTED',
      (req) => `${req.passOn}c`,
    ],
  },
  REDIRECTED: {
    path: '/redirected',
    thunk: (req) => {
      req.passOn += 'ZZZ'
    },
  },
})
