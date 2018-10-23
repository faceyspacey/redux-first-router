import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'

import configureStore from './configureStore'
import App from './App'

const { store } = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
