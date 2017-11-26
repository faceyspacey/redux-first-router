// @flow

import * as React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import type { Connector } from 'react-redux'

import { matchUrl } from '../utils/matchUrl'
import { stripBasename, parsePath } from '../smart-history/utils/path'

import toUrl from './utils/toUrl'
import handlePress from './utils/handlePress'
import preventDefault from './utils/preventDefault'

import type { To } from './utils/toUrl'
import type { OnClick } from './utils/handlePress'

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
      href={url}
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

  const { routes, locationState } = rudy
  const loc = parsePath(toUrl(to, routes))
  const matchers = { ...loc, query: q && loc.query, hash: h && loc.hash }
  const match = matchUrl(url, matchers, { partial, strict })
  console.log('MATCH', url, matchers)
  const active = !!(isActive ? isActive(match, locationState()) : match)

  return {
    style: active ? { ...style, ...activeStyle } : style,
    className: `${className || ''} ${active ? activeClassName : ''}`.trim(),
    'aria-current': active && ariaCurrent
  }
}

const mapState = (state: Object, { rudy, ...props }: OwnProps) => {
  const { url, basename, routesAdded } = rudy.locationState()
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
