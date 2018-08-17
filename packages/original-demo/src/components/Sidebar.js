import React from 'react'
import { connect } from 'react-redux'
import Link, { NavLink } from 'redux-first-router-link'
import { goToPage } from '../actions'
import styles from '../css/Sidebar'

const Sidebar = ({ onClick, path }) =>
  <div className={styles.sidebar}>
    <h2>SEO-FRIENDLY LINKS</h2>

    <NavLink activeClassName={styles.active} to='/'>HOME</NavLink>

    <NavLink activeClassName={styles.active} to='/foo/list/db-graphql'>
      DB & GRAPHQL
    </NavLink>

    <NavLink activeClassName={styles.active} to={['/bar', 'list', 'react-redux']}>
      REACT & REDUX
    </NavLink>

    <NavLink
      activeClassName={styles.active}
      to={{ type: 'LIST', params: { category: 'fp' } }}
    >
      FP
    </NavLink>

    <div style={{ height: 20 }} />
    <h2>EVENT HANDLERS</h2>

    <span className={active(path, '/')} onClick={() => onClick('HOME')}>
      HOME
    </span>

    <span
      className={active(path, '/list/db-graphql')}
      onClick={() => onClick('LIST', 'db-graphql')}
    >
      DB & GRAPHQL
    </span>

    <span
      className={active(path, '/list/react-redux')}
      onClick={() => onClick('LIST', 'react-redux')}
    >
      REACT & REDUX
    </span>

    <span
      className={active(path, '/list/fp')}
      onClick={() => onClick('LIST', 'fp')}
    >
      FP
    </span>

    <div style={{ height: 14 }} />

    <NavLink to={{ type: 'ADMIN' }} activeClassName={styles.active}>
      ADMIN
    </NavLink>
  </div>

const active = (currentPath, path) =>
  currentPath === path ? styles.active : ''

const mapDispatch = { onClick: goToPage }
const mapState = ({ location }) => ({ path: location.pathname })

export default connect(mapState, mapDispatch)(Sidebar)
