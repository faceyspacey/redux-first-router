// @flow

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import type { Store } from 'redux'
import type { Connector } from 'react-redux'

import toUrl from './utils/toUrl'
import handlePress from './utils/handlePress'
import preventDefault from './utils/preventDefault'

import type { To } from './utils/toUrl'
import type { OnClick } from './utils/handlePress'

type OwnProps = {
  to: To,
  href?: To,
  redirect?: boolean,
  replace?: boolean,
  tagName?: string,
  children?: any, // eslint-disable-line flowtype/no-weak-types
  onPress?: OnClick,
  onClick?: OnClick,
  down?: boolean,
  shouldDispatch?: boolean,
  target?: string
}

type Props = {
  dispatch: Function // eslint-disable-line flowtype/no-weak-types
} & OwnProps

type Context = {
  store: Store<*, *>
}

export const LinkInner = (
  {
    to,
    href,
    redirect,
    replace,
    tagName = 'a',
    children,
    onPress,
    onClick,
    down = false,
    shouldDispatch = true,
    target,
    dispatch,
    ...props
  }: Props,
  { store }: Context
) => {
  to = href || to // href is deprecated and will be removed in next major version

  const { routes, options: { basename } } = store.getState.rudy
  const url = toUrl(to, routes, basename)
  const handler = handlePress.bind(
    null,
    url,
    routes,
    onPress || onClick,
    shouldDispatch,
    target,
    dispatch,
    to,
    replace || redirect
  )
  const Root = tagName

  const localProps = {}

  if (tagName === 'a' && url) {
    localProps.href = url
  }

  if (down && handler) {
    localProps.onMouseDown = handler
    localProps.onTouchStart = handler
  }

  if (target) {
    localProps.target = target
  }

  return (
    <Root
      onClick={(!down && handler) || preventDefault}
      {...localProps}
      {...props}
    >
      {children}
    </Root>
  )
}

LinkInner.contextTypes = {
  store: PropTypes.object.isRequired
}

const connector: Connector<OwnProps, Props> = connect()

// $FlowIgnore
export default connector(LinkInner)
