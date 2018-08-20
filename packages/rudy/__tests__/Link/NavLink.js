import { createNavLink, event } from '../../__test-helpers__/createLink'

test('EXACT (true): DONT show active class', async () => {
  const { tree } = await createNavLink('/second/dog', {
    to: '/second',
    // partial: false, // this is the default
    activeClassName: 'active',
  })
  console.log(tree)
  expect(tree).toMatchSnapshot()
})

test('EXACT (false): SHOW active class', async () => {
  const { tree } = await createNavLink('/second/dog', {
    to: '/second',
    partial: true,
    activeClassName: 'active',
  })
  console.log(tree)
  expect(tree).toMatchSnapshot()
})

test('STRICT: DONT show active class', async () => {
  const { tree } = await createNavLink('/first', {
    to: '/first/',
    strict: true,
    activeClassName: 'active',
  })

  expect(tree).toMatchSnapshot()
})

test('show activeStyle', async () => {
  const { tree } = await createNavLink('/first', {
    to: '/first',
    activeStyle: { color: 'red' },
  })

  expect(tree).toMatchSnapshot()
})

test('combine with existing styles and class', async () => {
  const { tree } = await createNavLink('/first', {
    to: '/first',
    className: 'foo',
    style: { fontSize: 32 },
    activeClassName: 'active',
    activeStyle: { color: 'red' },
  })

  expect(tree).toMatchSnapshot()
})

test('reacts to state changes (onClick)', async () => {
  const { tree, store, component } = await createNavLink('/first', {
    to: '/second/bar',
    activeClassName: 'active',
  })

  expect(tree.props.className).toEqual('')
  expect(tree).toMatchSnapshot() /* ? tree */

  // store.dispatch({ type: 'SECOND', params: { param: 'bar' } })
  await tree.props.onClick(event) // this dispatches above action (obviously)

  const tree2 = component.toJSON() /* ? */

  expect(tree2.props.className).toEqual('active')
  expect(tree2).toMatchSnapshot()
})

test('isActive returns true', async () => {
  const { tree, store } = await createNavLink('/first', {
    to: '/first',
    activeClassName: 'active',
    isActive: (match, location) => {
      expect(match).toMatchSnapshot()
      expect(location).toMatchSnapshot()
      return match
    },
  })

  expect(tree).toMatchSnapshot()
})

test('isActive return false', async () => {
  const { tree, component, store } = await createNavLink('/first', {
    to: '/first',
    activeClassName: 'active',
    isActive: (match, location) => {
      expect(match).toMatchSnapshot()
      expect(location).toMatchSnapshot()
      return location.type === 'SECOND'
    },
  })

  console.log('tree', tree)
  expect(tree).toMatchSnapshot()

  await store.dispatch({ type: 'SECOND', params: { param: 'foo' } })
  expect(component.toJSON()).toMatchSnapshot()
})

it('supports custom HTML tag name', async () => {
  const { tree, store } = await createNavLink('/first', {
    to: '/second',
    activeClassName: 'active',
    component: 'div',
  })

  expect(tree).toMatchSnapshot()
})

it('supports custom HTML tag name in active mode', async () => {
  const { tree, store } = await createNavLink('/first', {
    to: '/first',
    activeClassName: 'active-foo',
    component: 'div',
  })

  expect(tree).toMatchSnapshot()
})

it('supports custom HTML tag name which is still a link', async () => {
  const { tree, store } = await createNavLink('/first', {
    to: 'somewhere',
    component: 'a',
    activeClassName: 'active-foo',
  })
  console.log(tree)
  expect(tree).toMatchSnapshot()
})

test('query params are ommitted', async () => {
  const { tree, store } = await createNavLink('/first', {
    to: '/first?foo=123',
    activeClassName: 'active',
  })
  console.log('STATE', store.getState().location)
  expect(tree).toMatchSnapshot()
})

test.only('paths with spaces', async () => {
  const { tree } = await createNavLink('/second', {
    to: '/second',
    activeClassName: 'active',
  })

  // console.log(tree)
  expect(tree).toMatchSnapshot()
})
