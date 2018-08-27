import createTest from '../../__helpers__/createTest'

createTest(
  'new requests cancel current pending (not committed) requests',
  {
    FIRST: {
      path: '/first',
      beforeLeave(req) {
        if (req.type === 'THIRD') return
        return new Promise((res) => setTimeout(res, 10))
      },
    },
    SECOND: {
      path: '/second',
      beforeEnter: () => 'secondBeforeEnter', // will not run because pipeline will be canceled
    },
    THIRD: {
      path: '/third',
      thunk: () => 'thirdThunk',
    },
  },
  [],
  async ({ dispatch, getLocation, getState }) => {
    let res = dispatch({ type: 'SECOND' })
    await dispatch({ type: 'THIRD' })

    const location = getLocation()
    expect(location.type).toEqual('THIRD')

    res = await res
    expect(res.type).toEqual('SECOND') // res will still be the action that was canceled

    expect(getLocation().type).toEqual('THIRD')
    expect(getState()).toMatchSnapshot()
  },
)
