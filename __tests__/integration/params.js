import createTest from '../../__helpers__/createTest'

test('bi-directional params transformation', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param1/:param2'
    },
    SECOND: {
      path: '/second/:param1/:param2'
    }
  }, [
    '/first/foo/bar',
    { type: 'SECOND', params: { param1: 'foo', param2: 'bar' } }
  ])
})

test('capitalizedWords', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param',
      capitalizedWords: true
    },
    SECOND: {
      path: '/second/:param',
      capitalizedWords: true
    }
  }, [
    '/first/james-gillmore',
    { type: 'SECOND', params: { param: 'James Gillmore' } }
  ])
})

test('convertNumbers', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param',
      convertNumbers: true
    },
    SECOND: {
      path: '/second/:param',
      convertNumbers: true
    }
  }, [
    '/first/100',
    { type: 'SECOND', params: { param: 100 } }
  ])
})

test('numbers not converted without convertNumbers option', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param'
    },
    SECOND: {
      path: '/second/:param'
    }
  }, [
    '/first/100',
    { type: 'SECOND', params: { param: 100 } }
  ])
})

test('fromPath + toPath', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param',
      fromPath: (val) => val.toUpperCase(),
      toPath: (val) => val.toLowerCase()
    },
    SECOND: {
      path: '/second/:param',
      fromPath: (val) => val.toUpperCase(),
      toPath: (val) => val.toLowerCase()
    }
  }, [
    '/first/foo',
    { type: 'SECOND', params: { param: 'bar' } }
  ])
})


test('does not parse a blank string "" as NaN', async () => {
  await createTest({
    FIRST: {
      path: '/first(.*)'
    },
    SECOND: {
      path: '/second(.*)'
    }
  }, [
    '/first',
    { type: 'SECOND' }
  ])
})

test('dispatch NOT_FOUND if not matched', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param'
    },
    SECOND: {
      path: '/second/:param'
    }
  }, [
    '/first/foo/bar',
    { type: 'SECOND', params: { missed: 'foo' } }
  ])
})

test('match optional params', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param?'
    },
    SECOND: {
      path: '/second/:param?'
    }
  }, [
    '/first/foo',
    { type: 'SECOND', params: { param: 'foo' } }
  ])
})

test('never returns an empty string when path has single optional param that is undefined', async () => {
  await createTest({
    FIRST: {
      path: '/first/:param?'
    },
    SECOND: {
      path: '/second/:param?'
    }
  }, [
    '/first',
    { type: 'SECOND', params: { param: undefined } }
  ])
})
