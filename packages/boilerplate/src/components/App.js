import React from 'react'
import { hot } from 'react-hot-loader'

import Sidebar from './Sidebar'
import Switcher from './Switcher'

import styles from '../css/App'

const App = () => (
  <div className={styles.app}>
    <Sidebar />
    <Switcher />
  </div>
)

export default hot(module)(App)
