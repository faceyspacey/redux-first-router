import React from 'react'
import { connect } from 'react-redux'
import { NavLink, Link } from '@respond-framework/link'
import styles from '../css/Sidebar'

// TODO: Use the link package
/* eslint-disable jsx-a11y/click-events-have-key-events */

// TODO: fix NavLink when object is passed via the "to" prop
const Sidebar = ({ path, dispatch }) => (
  <div className={styles.sidebar}>
    <h2>SEO-FRIENDLY LINKS</h2>

    <NavLink to="/" activeClassName={styles.active}>
      Home
    </NavLink>

    <Link
      role="link"
      tabIndex="0"
      to={{ type: 'LIST', params: { category: 'redux' } }}
    >
      Redux
    </Link>
    <span
      role="link"
      tabIndex="0"
      onClick={() => dispatch({ type: 'LIST', params: { category: 'react' } })}
    >
      React
    </span>

    <span
      role="link"
      tabIndex="0"
      onClick={() => dispatch({ type: 'NOT_FOUND' })}
    >
      NOT_FOUND
    </span>

    <div style={{ height: 20 }} />

    <h2>EVENT HANDLERS</h2>

    <span
      role="link"
      tabIndex="0"
      className={isActive(path, '/')}
      onClick={() => dispatch({ type: 'HOME' })}
    >
      Home
    </span>

    <span
      role="link"
      tabIndex="0"
      className={isActive(path, '/list/redux')}
      onClick={() => dispatch({ type: 'LIST', params: { category: 'redux' } })}
    >
      Redux
    </span>

    <span
      role="link"
      tabIndex="0"
      className={isActive(path, '/list/react')}
      onClick={() => dispatch({ type: 'LIST', params: { category: 'react' } })}
    >
      React
    </span>
  </div>
)

const isActive = (actualPath, expectedPath) =>
  actualPath === expectedPath ? styles.active : ''

const mapStateToProps = (state) => ({
  path: state.location.pathname,
})

export default connect(mapStateToProps)(Sidebar)
