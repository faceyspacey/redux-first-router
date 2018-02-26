import { redirect } from 'redux-first-router'

export default {
  HOME: {
    path: '/',
    beforeEnter: async (req) => {
      if (typeof window !== 'undefined') await new Promise(res => setTimeout(res, 4000))
      if (typeof window !== 'undefined' && window.foo) {
        const res = await req.dispatch({ type: 'LIST', params: { category: 'react' } })
      }
    }
    // beforeLeave: () => false
  },
  LIST: {
    path: '/list/:category',
    thunk: async ({ params }) => {
      const { category } = params
      const packages = await fetch(`/api/category/${category}`)

      if (packages.length === 0) {
        return {
          type: 'LIST',
          params: { category: 'redux' }
        }
      }

      return { category, packages }
    }
  }
}

// this is essentially faking/mocking the fetch api
// pretend this actually requested data over the network

const fetch = async path => {
  await new Promise(res => setTimeout(res, 500))
  const category = path.replace('/api/category/', '')

  switch (category) {
    case 'redux':
      return ['reselect', 'recompose', 'redux-first-router']
    case 'react':
      return [
        'react-router',
        'react-transition-group',
        'react-universal-component'
      ]
    default:
      return []
  }
}
