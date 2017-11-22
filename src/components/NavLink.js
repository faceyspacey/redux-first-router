// @flow

import React from 'react'
import PropTypes from 'prop-types'
import type { Store } from 'redux'

import matchPath from '../utils/matchPath'
import { stripBasename } from '../smart-history/utils/path'

import { LinkInner as Link } from './Link'
import toUrl from './utils/toUrl'
import type { To } from './utils/toUrl'
import type { OnClick } from './utils/handlePress'

type Props = {
  to: To,
  href?: To,
  redirect?: boolean,
  replace?: boolean,
  children?: any,
  onPress?: OnClick,
  onClick?: OnClick,
  down?: boolean,
  shouldDispatch?: boolean,
  target?: string,
  className?: string,
  style?: Object,
  activeClassName?: string,
  activeStyle?: Object,
  ariaCurrent?: string,
  exact?: boolean,
  strict?: boolean,
  isActive?: (?Object, Object) => boolean
}

type Context = {
  store: Store<*, *>
}

type State = {
  pathname: string
}

class NavLink extends React.Component<Props, State> {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  rudy: Object

  constructor(props: Props, context: Context) {
    super(props, context)
    const pathname = context.store.getState.rudy.locationState().pathname

    this.state = { pathname }
    this.rudy = context.store.getState.rudy
    this.dispatch = context.store.dispatch

    context.store.subscribe(() => {
      const pathname = this.rudy.locationState().pathname
      if (pathname === this.state.pathname) return
      console.log(123, pathname)
      this.setState({ pathname })
    })
  }

  render() {
    const {
      to: t,
      href,
      className,
      style,
      activeClassName = 'active',
      activeStyle,
      ariaCurrent = 'true',
      exact,
      strict,
      isActive,
      ...props
    } = this.props

    const to = href || t
    const pathname = this.state.pathname

    const { routes, locationState, history: { basename } } = this.rudy
    const path = toUrl(to, routes, basename).split('?')[0]

    const match = matchPath(pathname, {
      path: stripBasename(path, basename),
      exact,
      strict
    })

    const active = !!(isActive ? isActive(match, locationState()) : match)

    const combinedClassName = active
      ? [className, activeClassName].filter(i => i).join(' ')
      : className

    const combinedStyle = active ? { ...style, ...activeStyle } : style

    return (
      <Link
        to={to}
        className={combinedClassName}
        style={combinedStyle}
        aria-current={active && ariaCurrent}
        dispatch={this.dispatch}
        {...props}
      />
    )
  }
}

export default NavLink
