import createTest from '../../__helpers__/createTest'

createTest(
  'required key',
  {
    SECOND: {
      path: '/second',
      query: {
        key: true,
      },
    },
    THIRD: {
      path: '/third',
      query: {
        key: true,
      },
    },
  },
  [
    { type: 'SECOND' },
    { type: 'SECOND', query: { key: 'correct' } },
    '/third',
    '/third?key=correct',
  ],
)

createTest(
  'key required not to be there',
  {
    SECOND: {
      path: '/second',
      query: {
        key: false,
      },
    },
    THIRD: {
      path: '/third',
      query: {
        key: false,
      },
    },
  },
  [
    { type: 'SECOND', query: { key: 'missed' } },
    { type: 'SECOND' },
    '/third?key=missed',
    '/third',
  ],
)

createTest(
  'val equals string',
  {
    SECOND: {
      path: '/second',
      query: {
        key: 'correct',
      },
    },
    THIRD: {
      path: '/third',
      query: {
        key: 'correct',
      },
    },
  },
  [
    { type: 'SECOND', query: { key: 'wrong' } },
    { type: 'SECOND', query: { key: 'correct' } },
    '/third?key=wrong',
    '/third?key=correct',
  ],
)

createTest(
  'key/val matched by function',
  {
    SECOND: {
      path: '/second',
      query: {
        key: (val) => val === 'correct',
      },
    },
    THIRD: {
      path: '/third',
      query: {
        key: (val) => val === 'correct',
      },
    },
  },
  [
    { type: 'SECOND', query: { key: 'wrong' } },
    { type: 'SECOND', query: { key: 'correct' } },
    '/third?key=wrong',
    '/third?key=correct',
  ],
)

createTest(
  'val matched by regex',
  {
    SECOND: {
      path: '/second',
      query: {
        key: /correct/,
      },
    },
    THIRD: {
      path: '/third',
      query: {
        key: /correct/,
      },
    },
  },
  [
    { type: 'SECOND', query: { key: 'wrong' } },
    { type: 'SECOND', query: { key: 'correct' } },
    '/third?key=wrong',
    '/third?key=correct',
  ],
)

createTest(
  'route.toQuery/fromQuery',
  {
    SECOND: {
      path: '/second',
      toSearch: (v, k) => v.toUpperCase() + k.toUpperCase(),
      fromSearch: (v, k) => v.replace(k.toUpperCase(), '').toLowerCase(),
    },
    THIRD: {
      path: '/third',
      toSearch: (v, k) => v.toUpperCase() + k.toUpperCase(),
      fromSearch: (v, k) => v.replace(k.toUpperCase(), '').toLowerCase(),
    },
  },
  [
    { type: 'SECOND', query: { key: 'correct with spaces' } },
    { type: 'SECOND' },
    '/third?key=CORRECT%20WITH%20SPACESKEY',
    '/third',
  ],
)

createTest(
  'route.defaultQuery',
  {
    SECOND: {
      path: '/second',
      defaultQuery: { foo: 'bar' },
    },
    THIRD: {
      path: '/third',
      defaultQuery: (q) => ({ ...q, foo: 'bar' }),
    },
  },
  [
    { type: 'SECOND', query: { key: 'correct' } },
    { type: 'SECOND' },
    '/third?key=correct',
    '/third',
  ],
)
