import createTest from '../../__helpers__/createTest'

createTest(
  'required hash',
  {
    SECOND: {
      path: '/second',
      hash: true,
    },
    THIRD: {
      path: '/third',
      hash: true,
    },
  },
  [
    { type: 'SECOND', hash: 'correct' },
    { type: 'SECOND' },
    '/third#correct',
    '/third',
  ],
)

createTest(
  'hash required not to be there',
  {
    SECOND: {
      path: '/second',
      hash: false,
    },
    THIRD: {
      path: '/third',
      hash: false,
    },
  },
  [
    { type: 'SECOND' },
    { type: 'SECOND', hash: 'missed' },
    '/third',
    '/third#missed',
  ],
)

createTest(
  'hash equals string',
  {
    SECOND: {
      path: '/second',
      hash: 'correct',
    },
    THIRD: {
      path: '/third',
      hash: 'correct',
    },
  },
  [
    { type: 'SECOND', hash: 'correct' },
    { type: 'SECOND', hash: 'missed' },
    '/third#correct',
    '/third#missed',
  ],
)

createTest(
  'hash matched by function',
  {
    SECOND: {
      path: '/second',
      hash: (val) => val === 'correct',
    },
    THIRD: {
      path: '/third',
      hash: (val) => val === 'correct',
    },
  },
  [
    { type: 'SECOND', hash: 'correct' },
    { type: 'SECOND', hash: 'missed' },
    '/third#correct',
    '/third#missed',
  ],
)

createTest(
  'hash matched by regex',
  {
    SECOND: {
      path: '/second',
      hash: /correct/,
    },
    THIRD: {
      path: '/third',
      hash: /correct/,
    },
  },
  [
    { type: 'SECOND', hash: 'correct' },
    { type: 'SECOND', hash: 'missed' },
    '/third#correct',
    '/third#missed',
  ],
)

createTest(
  'route.toHash/fromHash',
  {
    SECOND: {
      path: '/second',
      toHash: (hash) => hash.toUpperCase(),
      fromHash: (hash) => hash.toLowerCase(),
    },
    THIRD: {
      path: '/third',
      toHash: (hash) => hash.toUpperCase(),
      fromHash: (hash) => hash.toLowerCase(),
    },
  },
  [
    { type: 'SECOND', hash: 'correct' },
    { type: 'SECOND' },
    '/third#CORRECT',
    '/third',
  ],
)

createTest(
  'route.defaultHash',
  {
    SECOND: {
      path: '/second',
      defaultHash: 'defaultHash',
    },
    THIRD: {
      path: '/third',
      defaultHash: (hash) => hash || 'defaultHash',
    },
  },
  [
    { type: 'SECOND', hash: 'correct' },
    { type: 'SECOND' },
    '/third#CORRECT',
    '/third',
  ],
)
