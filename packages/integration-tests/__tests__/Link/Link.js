import { NOT_FOUND } from '@respond-framework/rudy/src/types'
import createLink, { event } from '../../__test-helpers__/createLink'

test('ON_CLICK: dispatches location-aware action', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    children: 'CLICK ME',
  }) /* ? $.tree */

  expect(tree).toMatchSnapshot() /* ? store.getState() */

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).toEqual('/first')
  expect(location.type).toEqual('FIRST')
})

it('ON_CLICK: does NOT dispatch if shouldDispatch === false', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    shouldDispatch: false,
  })

  expect(tree).toMatchSnapshot()

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).not.toEqual('/first')
  expect(location.type).not.toEqual('FIRST')
  expect(location.pathname).toEqual('/')
})

it('ON_CLICK: does NOT dispatch if onClick returns false', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    onClick: () => false,
  })

  expect(tree).toMatchSnapshot()

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).not.toEqual('/first')
  expect(location.type).not.toEqual('FIRST')
  expect(location.pathname).toEqual('/')
})

it('ON_CLICK: DOES dispatch if onClick returns true', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    onClick: () => true,
  })

  expect(tree).toMatchSnapshot()

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).toEqual('/first')
  expect(location.type).toEqual('FIRST')
})

it('ON_CLICK: DOES dispatch if onClick returns undefined', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    onClick: () => undefined,
  })

  expect(tree).toMatchSnapshot()

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).toEqual('/first')
  expect(location.type).toEqual('FIRST')
})

it('ON_MOUSE_DOWN: dispatches action onMouseDown if down === true', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    down: true,
  }) /* ? $.tree */

  expect(tree).toMatchSnapshot()

  await tree.props.onClick(event) // e.preventDefault() called and nothing dispatched + linking prevented

  let { location } = store.getState()
  expect(location.pathname).toEqual('/')

  await tree.props.onMouseDown(event)

  location = store.getState().location /* ? */

  expect(location.pathname).toEqual('/first')
  expect(location.type).toEqual('FIRST')
})

it('ON_CLICK: dispatches redirect if redirect === true', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    children: 'CLICK ME',
    redirect: true,
  }) /* ? $.tree */

  expect(tree).toMatchSnapshot() /* ? store.getState() */

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).toEqual('/first')
  expect(location.kind).toEqual('replace')
})

it('ON_TOUCH_START: dispatches action onTouchStart if down === true', async () => {
  const { tree, store } = await createLink({
    to: '/first',
    down: true,
  }) /* ? $.tree */

  expect(tree).toMatchSnapshot()

  await tree.props.onTouchStart(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).toEqual('/first')
  expect(location.type).toEqual('FIRST')
})

it('converts href as array of strings to path', async () => {
  const { tree, store } = await createLink({
    to: ['second', 'bar'],
  }) /* ? $.tree */

  expect(tree).toMatchSnapshot() /* ? store.getState() */

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).toEqual('/second/bar')
  expect(location.type).toEqual('SECOND')
})

it('converts href as action object to path', async () => {
  const action = { type: 'SECOND', params: { param: 'bar' } }
  const { tree, store } = await createLink({ to: action }) /* ? $.tree */

  expect(tree).toMatchSnapshot() /* ? store.getState() */

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */

  expect(location.pathname).toEqual('/second/bar')
  expect(location.type).toEqual('SECOND')
})

it('converts href as non-matched action object to "#" for path', async () => {
  const action = { type: 'MISSED' }
  const { tree, store } = await createLink({ to: action }) /* ? $.tree */

  expect(tree.props.href).toEqual('/#')
  expect(tree).toMatchSnapshot()

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */
  expect(location.type).toEqual(NOT_FOUND)
})

it('converts invalid href to "#" for path', async () => {
  const { tree, store } = await createLink({ to: '' }) /* ? $.tree */

  expect(tree.props.href).toEqual('/#')
  expect(tree).toMatchSnapshot()

  await tree.props.onClick(event)

  const { location } = store.getState() /* ? $.location */
  expect(location.type).toEqual(NOT_FOUND)
})

it('supports custom HTML tag name', async () => {
  const { tree, store } = await createLink({
    to: 'somewhere',
    component: 'div',
  }) /* ? $.tree */

  expect(tree).toMatchSnapshot()
})

it('supports custom HTML tag name which is still a link', async () => {
  const { tree, store } = await createLink({
    to: 'somewhere',
    component: 'a',
  }) /* ? $.tree */

  expect(tree).toMatchSnapshot()
})

test('with basename options generates url with basename', async () => {
  const options = { basenames: ['/base-foo'] }
  const { tree, store } = await createLink(
    {
      to: '/first',
      children: 'CLICK ME',
    },
    '/base-foo/third', // basename will be automatically disovered based on initial entry's path and the basenames array
    options,
  )

  expect(tree.props.href).toEqual('/base-foo/first')
  await tree.props.onClick(event)

  expect(store.getState().location.type).toEqual('FIRST')
  expect(store.getState().location.basename).toEqual('/base-foo')
  expect(store.getState().location).toMatchSnapshot()
})
