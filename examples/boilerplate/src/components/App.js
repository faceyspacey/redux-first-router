import React from 'react'

import Sidebar from './Sidebar'
import Switcher from './Switcher'

import styles from '../css/App'

const App = () => (
  <div className={styles.app}>
    <Sidebar />
    <Switcher />
  </div>
)

export default App
