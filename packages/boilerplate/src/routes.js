export default {
  HOME: {
    path: '/',
    onEnter: () => {
      // eslint-disable-next-line no-console,no-undef
      console.log(document.querySelector('.Home__content--319uD'))
    },
    beforeEnter: async (req) => {
      // eslint-disable-next-line no-undef
      if (typeof window !== 'undefined' && window.foo) {
        await new Promise((res) => setTimeout(res, 3000))
      }

      // eslint-disable-next-line no-undef
      if (typeof window !== 'undefined' && window.foo) {
        await req.dispatch({ type: 'LIST', params: { category: 'react' } })
      }
    },
    // beforeLeave: async ({ type }) => {
    //   return false
    //   await new Promise(res => setTimeout(res, 10000))
    //   return type === 'NOT_FOUND'
    // }
  },
  // eslint-disable-next-line no-console
  PATHLESS: () => console.log('PATHLESS'),
  LIST: {
    path: '/list/:category',
    thunk: async ({ params }) => {
      const { category } = params
      const packages = await fetch(`/api/category/${category}`)

      if (packages.length === 0) {
        return {
          type: 'LIST',
          params: { category: 'redux' },
        }
      }

      return { category, packages }
    },
  },
}

// this is essentially faking/mocking the fetch api
// pretend this actually requested data over the network

const fetch = async (path) => {
  await new Promise((res) => setTimeout(res, 500))
  const category = path.replace('/api/category/', '')

  switch (category) {
    case 'redux':
      return ['reselect', 'recompose', 'redux-first-router']
    case 'react':
      return [
        'react-router',
        'react-transition-group',
        'react-universal-component',
      ]
    default:
      return []
  }
}
