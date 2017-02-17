import createHistory from 'history/createMemoryHistory'
import connectRoutes from '../src/connectRoutes'


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

  return connectRoutes(history, routesMap, options)
}
