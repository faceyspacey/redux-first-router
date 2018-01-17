import createTest from '../../__helpers__/createTest'

test('required hash', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      hash: true
    },
    SECOND: {
      path: '/second',
      hash: true
    }
  }, [
    '/first#foo',
    { type: 'SECOND', hash: 'bar' },
    '/first',
    { type: 'SECOND' }
  ])
})

test('hash required not to be there', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      hash: false
    },
    SECOND: {
      path: '/second',
      hash: false
    }
  }, [
    '/first',
    { type: 'SECOND' },
    '/first#foo',
    { type: 'SECOND', hash: 'bar' }
  ])
})

test('hash equals string', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      hash: 'foo'
    },
    SECOND: {
      path: '/second',
      hash: 'bar'
    }
  }, [
    '/first#foo',
    { type: 'SECOND', hash: 'bar' },
    '/first#baz',
    { type: 'SECOND', hash: 'jar' }
  ])
})

test('hash matched by function', async () => {
  await createTest({
    FIRST: {
      path: '/first',
      hash: (val) => val === 'foo'
    },
    SECOND: {
      path: '/second',
      hash: (val) => val === 'bar'
    }
  }, [
    '/first#foo',
    { type: 'SECOND', hash: 'bar' },
    '/first#baz',
    { type: 'SECOND', hash: 'jar' }
  ])
})

test('hash matched by regex', async () => {
  const { store } = await createTest({
    FIRST: {
      path: '/first',
      hash: /foo/
    },
    SECOND: {
      path: '/second',
      hash: /bar/
    }
  }, [
    '/first#foo',
    { type: 'SECOND', hash: 'bar' },
    '/first#baz',
    { type: 'SECOND', hash: 'jar' }
  ])
})
