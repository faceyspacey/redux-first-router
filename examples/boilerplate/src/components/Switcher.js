import React from 'react'
import { connect } from 'react-redux'
import universal from 'react-universal-component'
import Async from './AsyncComp'

import styles from '../css/Switcher'

const UniversalComponent = universal(({ page }) => import(`./${page}`), {
  minDelay: 500,

  loading: () => (
    <div className={styles.spinner}>
      <div />
    </div>
  ),

  error: (e) => {
    console.log(e); return <div className={styles.notFound}>PAGE NOT FOUND - 404</div>
  }
})

const Switcher = ({ page }) => {
// shitty way to determine dynamic universal vs RUC
  if (typeof page !== 'string') {
    return (
      <div className={styles.switcher}>
        <Async />
      </div>
    )
  }
  return (
    <div className={styles.switcher}>
      <UniversalComponent page={page} />
    </div>
  )
}

const mapStateToProps = state => ({
  page: state.page
})

export default connect(mapStateToProps)(Switcher)
