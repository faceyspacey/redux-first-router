import createTest from '../../__helpers__/createTest'

createTest('bi-directional params transformation', {
  SECOND: {
    path: '/second/:param1/:param2'
  },
  THIRD: {
    path: '/third/:param1/:param2'
  }
}, [
  { type: 'SECOND', params: { param1: 'foo', param2: 'bar' } },
  '/third/foo/bar'
])

createTest('capitalizedWords', {
  SECOND: {
    path: '/second/:param',
    capitalizedWords: true
  },
  THIRD: {
    path: '/third/:param',
    capitalizedWords: true
  }
}, [
  { type: 'SECOND', params: { param: 'James Gillmore' } },
  '/third/james-gillmore'
])

createTest('convertNumbers', {
  SECOND: {
    path: '/second/:param',
    convertNumbers: true
  },
  THIRD: {
    path: '/third/:param',
    convertNumbers: true
  }
}, [
  { type: 'SECOND', params: { param: 100 } },
  '/third/100'
])

createTest('numbers NOT converted without convertNumbers option', {
  SECOND: {
    path: '/second/:param'
  },
  THIRD: {
    path: '/third/:param'
  }
}, [
  { type: 'SECOND', params: { param: 100 } },
  '/third/100'
])

createTest('fromPath + toPath', {
  SECOND: {
    path: '/second/:param',
    fromParam: (val) => val.toUpperCase(),
    toParam: (val) => val.toLowerCase()
  },
  THIRD: {
    path: '/third/:param',
    fromParam: (val) => val.toUpperCase(),
    toParam: (val) => val.toLowerCase()
  }
}, [
  { type: 'SECOND', params: { param: 'bar' } },
  '/third/foo'
])

createTest('does not parse a blank string "" as NaN', {
  SECOND: {
    path: '/second(.*)'
  },
  THIRD: {
    path: '/third(.*)'
  }
}, [
  { type: 'SECOND' },
  '/third'
])

createTest('dispatch NOT_FOUND if not matched', {
  SECOND: {
    path: '/second/:param'
  },
  THIRD: {
    path: '/third/:param'
  }
}, [
  { type: 'SECOND', params: { missed: 'foo' } },
  '/third/foo/bar'
])

createTest('match optional params', {
  SECOND: {
    path: '/second/:param?'
  },
  THIRD: {
    path: '/third/:param?'
  }
}, [
  { type: 'SECOND', params: { param: 'foo' } },
  '/third/foo',
  { type: 'SECOND' },
  '/third'
])

createTest('never returns an empty string when path has single optional param that is undefined', {
  SECOND: {
    path: '/second/:param?'
  },
  THIRD: {
    path: '/third/:param?'
  }
}, [
  { type: 'SECOND', params: { param: undefined } },
  '/third'
])

createTest('match "multi segment params" as single param', {
  REPO1: {
    path: '/repo1/:user/:repo/blob/:branch/:filePath+'
  },
  REPO2: {
    path: '/repo2/:user/:repo/blob/:branch/:filePath+'
  }
}, [
  {
    type: 'REPO1',
    params: {
      user: 'faceyspacey',
      repo: 'rudy',
      branch: 'master',
      filePath: 'core/createRouter.js'
    }
  },
  '/repo2/faceyspacey/rudy/blob/master/src/core/createRouter.js',
  {
    type: 'REPO1',
    params: {
      user: 'faceyspacey',
      repo: 'rudy',
      branch: 'missed'
    }
  }
])

createTest('optionally match "multi segment params" as single param', {
  REPO1: {
    path: '/repo1/:user/:repo/blob/:branch/:filePath*'
  },
  REPO2: {
    path: '/repo2/:user/:repo/blob/:branch/:filePath*'
  }
}, [
  {
    type: 'REPO1',
    params: {
      user: 'faceyspacey',
      repo: 'rudy',
      branch: 'master'
    }
  },
  '/repo2/faceyspacey/rudy/blob/master'
])

createTest('match MULTIPLE "multi segment params" as single param', {
  SECOND: {
    path: '/second/:segments1+/bla/:segments2+'
  },
  THIRD: {
    path: '/third/:segments1+/bla/:segments2+'
  }
}, [
  {
    type: 'SECOND',
    params: {
      segments1: 'foo/bar',
      segments2: 'baz/yo/sdf'
    }
  },
  '/third/foo/bar/bla/baz/yo/sdf'
])

createTest('optional static segments ("aliases")', {
  SECOND: {
    path: '/second/(list)?'
  },
  THIRD: {
    path: '/third/(list)*'
  }
}, [
  { type: 'SECOND' },
  '/third/list',
  '/third'
])

createTest('static regexes', {
  SECOND: {
    path: '/second/(list|all)'
  },
  THIRD: {
    path: '/third/(list|all)'
  }
}, [
  { type: 'SECOND' }, // this won't match unfortunately, as the compiled URL can't choose "list" or "all"
  '/third/list',
  '/third/all'
])

createTest('regex parameters', {
  SECOND: {
    path: '/second/:id(\\d+)'
  },
  THIRD: {
    path: '/third/:id(\\d+)'
  }
}, [
  { type: 'SECOND', params: { id: 100 } }, // but these will match (CONCLUSION: give them dynamic segments so you can choose in `action.params`)
  { type: 'SECOND', params: { id: 'foo' } },
  '/third/100',
  '/third/foo'
])
