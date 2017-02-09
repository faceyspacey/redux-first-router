import changeAddressBar from '../src/dom-utils/changeAddressBar'
import changePageTitle from '../src/dom-utils/changePageTitle'


describe('changeAddressBar()', () => {
  it('when pathname changes push new pathname on to addressbar', () => {
    const locationState = { pathname: 'foo' }
    const currentPathname = 'bar'
    const history = []

    const ret = changeAddressBar(locationState, currentPathname, history)

    console.log(ret)
    console.log(history)

    expect(history).toEqual([{ pathname: 'foo' }])
    expect(ret).toEqual('foo')
  })

  it('when pathname does not change, do not push pathname on to address bar', () => {
    const locationState = { pathname: 'foo' }
    const currentPathname = 'foo'
    const history = []

    const ret = changeAddressBar(locationState, currentPathname, history)

    console.log(ret)
    console.log(history)

    expect(history).toEqual([])
    expect(ret).toEqual('foo')
  })
})


describe('changePageTitle()', () => {
  it('when title changes set it to document.title', () => {
    const document = { }
    const title = 'foo'

    const ret = changePageTitle(document, title)

    console.log(document)

    expect(document).toEqual({ title: 'foo' })
    expect(ret).toEqual('foo')
  })

  it('when title changes do not set document.title', () => {
    const document = { title: 'foo' }
    const title = 'foo'

    const ret = changePageTitle(document, title)

    console.log(document)

    expect(document).toEqual({ title: 'foo' })
    expect(ret).toEqual(null) // no return value when title does not change
  })
})
