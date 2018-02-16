/* eslint-disable global-require */

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import AppContainer from 'react-hot-loader/lib/AppContainer'
import App from './components/App'
import configureStore from './configureStore'

const { store, firstRoute } = configureStore(window.REDUX_STATE)

const render = App => {
  const root = document.getElementById('root')

  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <App />
      </Provider>
    </AppContainer>,
    root
  )
}

store.dispatch(firstRoute()).then(() => render(App))

if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept('./components/App', () => {
    const App = require('./components/App').default

    render(App)
  })
}
