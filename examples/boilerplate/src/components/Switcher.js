import React from 'react'
import { connect } from 'react-redux'
import universal from 'react-universal-component'

import styles from '../css/Switcher'

const UniversalComponent = universal(({ page }) => import(`./${page}`), {
  minDelay: 500,

  loading: () => (
    <div className={styles.spinner}>
      <div />
    </div>
  ),

  error: () => <div className={styles.notFound}>PAGE NOT FOUND - 404</div>
})

const Switcher = ({ page }) => (
  <div className={styles.switcher}>
    <UniversalComponent page={page} />
  </div>
)

const mapStateToProps = state => ({
  page: state.page
})

export default connect(mapStateToProps)(Switcher)
