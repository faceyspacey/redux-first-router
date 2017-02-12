import createHistory from 'history/createMemoryHistory'
import connectTypes from '../src/connectTypes'


export default (path = '/', options = { title: 'title', location: 'location' }) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: '/second/:param',
  }

  const history = createHistory({
    initialEntries: [path],
    initialIndex: 0,
    keyLength: 6,
  })

  return connectTypes(history, routesMap, options)
}
