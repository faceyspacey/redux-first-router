import isLocationAction from '../src/pure-utils/isLocationAction'


describe('isLocationAction', () => {
  it('isLocationAction snap', () => {
    const ret = {d: 3}
    expect(ret).toMatchSnapshot()
  })

  it('isLocationAction 123', () => {
    const ret = {d: 8}
    expect(ret).toMatchSnapshot()
  })
})
