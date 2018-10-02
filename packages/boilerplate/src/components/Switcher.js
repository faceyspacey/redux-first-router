import React from 'react'
import { connect } from 'react-redux'
// import universal from 'react-universal-component'

import universal from 'react-universal-component'
import styles from '../css/Switcher'

const determineHowToLoad = (props) =>
  typeof props.component !== 'string'
    ? props.component()
    : import(`./${props.component}`)

const UniversalComponent = universal(determineHowToLoad, {
  minDelay: 500,

  loading: () => (
    <div className={styles.spinner}>
      <div/>
    </div>
  ),
  onError: (e) => {
    console.log(e)
  },
  error: () => <div className={styles.notFound}>PAGE NOT FOUND - 404</div>,
})

const Switcher = ({ page }) => {
  console.log(page)
  return (
    <div className={styles.switcher}>
      {page.component ? <UniversalComponent component={page.component}/> :
        <UniversalComponent component={page}/>}
    </div>
  )
}
const mapStateToProps = (state) => ({
  page: state.page,
})

export default connect(mapStateToProps)(Switcher)
