/* eslint-env browser */

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import configureStore from './configureStore'

const { store, firstRoute } = configureStore(window.REDUX_STATE)

const root = document.getElementById('root')

const render = () =>
  ReactDOM.hydrate(
    <Provider store={store}>
      <App />
    </Provider>,
    root,
  )

store.dispatch(firstRoute()).then(() => {
  render()
})

if (module.hot) {
  module.hot.accept('./components/App', render)
}
