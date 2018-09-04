import createScene from '@respond-framework/rudy/src/createScene'

const routesMap = {
  SECOND: {
    path: '/second',
    error: (error) => ({ ...error, foo: 'bar' }),
  },
  THIRD: {
    path: '/third',
    action: (arg) => (req, type) => ({ params: { foo: arg }, type }),
  },
  FOURTH: {
    path: '/fourth',
    action: ['customCreator'],
    customCreator: (arg) => (req, type) => ({ params: { foo: arg }, type }),
  },
  PLAIN: {
    action: (arg) => ({ foo: arg }),
  },
  NOT_FOUND: '/not-found-foo',
}

test('createScene returns types, actions, routes, exportString', () => {
  const { types, actions, routes, exportString } = createScene(routesMap, {
    logExports: true,
  })

  expect(types).toMatchSnapshot()
  expect(actions).toMatchSnapshot()
  expect(routes).toMatchSnapshot()
  expect(exportString).toMatchSnapshot()
})

test('createScene returns types, actions, routes, exportString (/w scene + basename options)', () => {
  const { types, actions, routes, exportString } = createScene(routesMap, {
    scene: 'SCENE',
    basename: '/base-name',
    logExports: true,
  })

  expect(types).toMatchSnapshot()
  expect(actions).toMatchSnapshot()
  expect(routes).toMatchSnapshot()
  expect(exportString).toMatchSnapshot()
})

test('call createScene twice on same routes', () => {
  const { routes: r } = createScene(routesMap, { scene: 'scene' })
  const { types, actions, routes: r2, exportString } = createScene(r, {
    scene: 'double',
    logExports: true,
  })

  expect(types).toMatchSnapshot()
  expect(actions).toMatchSnapshot()
  expect(r2).toMatchSnapshot()
  expect(exportString).toMatchSnapshot()
})
