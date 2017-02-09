import createHistory from 'history/createMemoryHistory'
import connectTypes from '../src/connectTypes'


export default (initialEntry = '/', options = { title: 'title', location: 'location' }) => {
  const routesMap = {
    FIRST: '/first',
    SECOND: '/second/:param',
  }

  const history = createHistory({
    initialEntries: [initialEntry],
    initialIndex: 0,
    keyLength: 6,
  })

  return connectTypes(history, routesMap, options)
}
