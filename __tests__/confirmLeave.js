import { setupAll } from '../__test-helpers__/setup'

it('can leave (via confirmLeave returning falsy)', () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => undefined
    },
    SECOND: '/second'
  }

  const displayConfirmLeave = jest.fn()
  const options = { displayConfirmLeave }
  const { store, history } = setupAll('/first', options, { routesMap })
  store.dispatch({ type: 'SECOND' })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(displayConfirmLeave).not.toBeCalled()
  expect(history.location.pathname).toEqual('/second')
})

it('can leave (via user decision)', () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => {
        const message = 'are u sure u wanna leave?'

        if (action.type === 'SECOND' && state.location.type === 'FIRST') {
          return message
        }
      }
    },
    SECOND: '/second'
  }

  const options = {
    displayConfirmLeave: (message, callback) => {
      callback(true)
    }
  }
  const { store, history } = setupAll('/first', options, { routesMap })
  store.dispatch({ type: 'SECOND' })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('cannot leave (via user decision)', () => {
  const message = 'are u sure u wanna leave?'

  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => {
        if (action.type === 'SECOND' && state.location.type === 'FIRST') {
          return message
        }
      }
    },
    SECOND: '/second'
  }

  const options = {
    displayConfirmLeave: (msg, callback) => {
      expect(msg).toEqual(message)
      callback(false)
    }
  }
  const { store, history } = setupAll('/first', options, { routesMap })
  store.dispatch({ type: 'SECOND' })

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})

it('can leave (via user decision - default using window.confirm)', () => {
  window.confirm = msg => {
    expect(msg).toEqual(message)
    return true
  }
  const message = 'are u sure u wanna leave?'

  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => {
        if (action.type === 'SECOND' && state.location.type === 'FIRST') {
          return message
        }
      }
    },
    SECOND: '/second'
  }

  const { store, history } = setupAll('/first', undefined, { routesMap })
  store.dispatch({ type: 'SECOND' })

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('HISTORY: can leave (via confirmLeave returning falsy)', () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => undefined
    },
    SECOND: '/second'
  }

  const displayConfirmLeave = jest.fn()
  const options = { displayConfirmLeave }
  const { history, store } = setupAll('/first', options, { routesMap })
  history.push('/second')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(displayConfirmLeave).not.toBeCalled()
})

it('HISTORY: can leave (via user decision)', () => {
  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => {
        const message = 'are u sure u wanna leave?'

        if (action.type === 'SECOND' && state.location.type === 'FIRST') {
          return message
        }
      }
    },
    SECOND: '/second'
  }

  const options = {
    displayConfirmLeave: (message, callback) => {
      callback(true)
    }
  }
  const { store, history } = setupAll('/first', options, { routesMap })
  history.push('/second')

  const { type } = store.getState().location
  expect(type).toEqual('SECOND')
  expect(history.location.pathname).toEqual('/second')
})

it('HISTORY: cannot leave (via user decision)', () => {
  const message = 'are u sure u wanna leave?'

  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => {
        if (action.type === 'SECOND' && state.location.type === 'FIRST') {
          return message
        }
      }
    },
    SECOND: '/second'
  }

  const options = {
    displayConfirmLeave: (msg, callback) => {
      expect(msg).toEqual(message)
      callback(false)
    }
  }
  const { history, store } = setupAll('/first', options, { routesMap })
  history.push('/second')

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})

it('can leave throws (React Native where window.confirm does not exist)', () => {
  global.confirm = undefined

  const message = 'are u sure u wanna leave?'

  const routesMap = {
    FIRST: {
      path: '/first',
      confirmLeave: (state, action) => {
        if (action.type === 'SECOND' && state.location.type === 'FIRST') {
          return message
        }
      }
    },
    SECOND: '/second'
  }

  const { store, history } = setupAll('/first', undefined, { routesMap })
  expect(() => store.dispatch({ type: 'SECOND' })).toThrow()

  const { type } = store.getState().location
  expect(type).toEqual('FIRST')
  expect(history.location.pathname).toEqual('/first')
})
