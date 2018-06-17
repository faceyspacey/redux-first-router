import React from 'react'
import { connect } from 'react-redux'
import Async from './AsyncComp'
import { UniversalComponent } from '../routes'
import styles from '../css/Switcher'


const Switcher = ({ page }) => {
// shitty way to determine dynamic universal vs RUC
  console.log(page)
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
