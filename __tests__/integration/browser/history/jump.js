// import createTest from '../../../../__helpers__/createTest'
// import { get } from '../../../../src/history/utils/sessionStorage'
// import { locationToUrl } from '../../../../src/utils'
// import { jump } from '../../../../src/actions'

// createTest('set(action, n)', {
//   SECOND: '/second',
//   FIRST: '/:foo?'
// }, {
//   testBrowser: true,
//   basenames: ['/base'],
//   convertNumbers: true
// }, [], async ({ dispatch, getLocation }) => {
//   await dispatch({ type: 'SECOND' })

//   const action = {
//     params: { foo: 'bar' },
//     query: { hell: 'yea' },
//     hash: 'yolo',
//     basename: '/base',
//     state: { something: 123 }
//   }

//   await dispatch(jump(action, -1))

//   expect(getLocation().entries[0]).toMatchObject(action)
//   expect(get().entries[0][1]).toEqual(action.state)

//   expect(locationToUrl(window.location)).toEqual('/second')

//   expect(get()).toMatchSnapshot()
//   expect(getLocation()).toMatchSnapshot()
// })
