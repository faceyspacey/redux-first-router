import React from 'react'
import { hot } from 'react-hot-loader'

import Sidebar from './Sidebar'
import Switcher from './Switcher'
import { ConnectedRouter, Route } from '../router'

import styles from '../css/App'

class App extends React.Component {
  componentDidMount() {
    console.log()
  }

  render() {
    return (
      <div className={styles.app}>
        <Sidebar />
        <Switcher />
        <ConnectedRouter>
          <Route
            path="/test"
            component={() => import('./Test')}
            onEnter={() => {
              console.log('ENTERING')
            }}
            beforeEnter={async (req) => {
              // eslint-disable-next-line no-undef
              if (typeof window !== 'undefined' && window.foo) {
                await new Promise((res) => setTimeout(res, 3000))
              }

              // eslint-disable-next-line no-undef
              if (typeof window !== 'undefined' && window.foo) {
                await req.dispatch({
                  type: 'LIST',
                  params: { category: 'react' },
                })
              }
            }}
          />
        </ConnectedRouter>
      </div>
    )
  }
}

export default hot(module)(App)
