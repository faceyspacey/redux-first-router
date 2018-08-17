import React from 'react'
import { connect } from 'react-redux'

import styles from '../css/DevTools'

const DevTools = () =>
  <div className={styles.container}>
    <div className={styles.titleBar}>
      <span>ACTIONS</span>
      <span>DEV-TOOLS</span>
      <span>STATE</span>
    </div>

    <div className={styles.devTools}>
      <ActionsBox />
      <StateBox />
    </div>
  </div>

const ActionsBoxComponent = ({ actions }) =>
  <div className={styles.actionsBox}>
    <pre>{JSON.stringify(actions, null, 1)}</pre>
  </div>

const ActionsBox = connect(({ actions }) => ({ actions }))(ActionsBoxComponent)

const StateBoxComponent = state =>
  <div className={styles.stateBox}>
    <pre>{JSON.stringify(state, null, 1)}</pre>
  </div>

const StateBox = connect(state => ({ ...state, actions: undefined }))(
  StateBoxComponent
)

export default DevTools
