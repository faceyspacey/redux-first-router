import isLocationAction from '../src/pure-utils/isLocationAction'


describe('isLocationAction', () => {
  it('isLocationAction', () => {
    const ret = isLocationAction({})
    expect(ret).toBeFalsy()
  })

  it('isLocationAction snap', () => {
    const ret = {d: 2}
    expect(ret).toMatchSnapshot()
  })

  it('isLocationAction 123', () => {
    const ret = {d: 4}
    expect(ret).toMatchSnapshot()
  })
})
