// @flow

import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import type { Connector } from 'react-redux'

import { matchUrl } from '../utils'
import { stripBasename, parsePath } from '../history/utils'

import { toUrl, handlePress, preventDefault } from './utils'
import type { To, OnClick } from './utils'

type OwnProps = {
  to: To,
  redirect?: boolean,
  children?: any,
  onPress?: OnClick,
  onClick?: OnClick,
  down?: boolean,
  shouldDispatch?: boolean,
  target?: string,
  style?: Object,
  className?: string,
  activeStyle?: Object,
  activeClassName?: string,
  ariaCurrent?: string,
  partial?: boolean,
  strict?: boolean,
  query?: boolean,
  hash?: boolean,
  isActive?: (?Object, Object) => boolean,
  component?: string | React.ComponentType<any>,
  rudy: Object
}

type Props = {
  dispatch: Function,
  basename: string,
  routesAdded?: number,
  url?: string,
} & OwnProps

type Context = {
  store: Store<*, *>
}

const LinkInner = (props) => {
  const {
    to,
    redirect,
    component: Component = 'a',
    children,
    onPress,
    onClick,
    down = false,
    shouldDispatch = true,
    target,
    dispatch,
    basename,
    rudy,
    routesAdded,

    url: u,
    isActive,
    partial,
    strict,
    query,
    hash,
    activeStyle,
    activeClassName,
    ariaCurrent,

    ...p
  } = props

  const url = toUrl(to, rudy.routes, basename)
  const hasHref = (Component === 'a' || typeof Component !== 'string') && url
  const handler = handlePress.bind(
    null,
    url,
    rudy.routes,
    onPress || onClick,
    shouldDispatch,
    target,
    dispatch,
    to,
    redirect
  )

  return (
    <Component
      onClick={(!down && handler) || preventDefault}
      href={hasHref ? url : undefined}
      target={target}
      onMouseDown={down ? handler : undefined}
      onTouchStart={down ? handler : undefined}
      {...p}
      {...navLinkProps(props)}
    >
      {children}
    </Component>
  )
}

const navLinkProps = (props: Props) => {
  if (!props.url) return

  const {
    url,
    to,
    isActive,
    partial,
    strict,
    query: q,
    hash: h,

    style,
    className,
    activeStyle,
    activeClassName = '',
    ariaCurrent = 'true',

    rudy
  } = props

  const { routes, getLocation } = rudy
  const loc = parsePath(toUrl(to, routes))
  const matchers = { ...loc, query: q && loc.query, hash: h && loc.hash }
  const match = matchUrl(url, matchers, { partial, strict })

  const active = !!(isActive ? isActive(match, getLocation()) : match)

  return {
    style: active ? { ...style, ...activeStyle } : style,
    className: `${className || ''} ${active ? activeClassName : ''}`.trim(),
    'aria-current': active && ariaCurrent
  }
}

const mapState = (state: Object, { rudy, ...props }: OwnProps) => {
  const { url, basename, routesAdded } = rudy.getLocation()
  const isNav = props.activeClassName || props.activeStyle
  return { rudy, basename, routesAdded, url: isNav && url }
}

const connector: Connector<OwnProps, Props> = connect(mapState)

const LinkConnected = connector(LinkInner)

const Link = (props: OwnProps, context: Context) =>
  <LinkConnected rudy={context.store.getState.rudy} {...props} />

Link.contextTypes = { store: PropTypes.object.isRequired }

export default Link

export const NavLink = ({ activeClassName = 'active', ...props }: Object) =>
  <Link activeClassName={activeClassName} {...props} />
