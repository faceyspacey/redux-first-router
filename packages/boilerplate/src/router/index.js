/* eslint-disable */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as Rudy from '@respond-framework/rudy'

const routesMap = {}

class Router extends Component {
  constructor(props) {
    super(props);

    const childs = Array.isArray(props.children) ? props.children : [props.children]

    const routeKey = childs[0].props.component().chunkName()
    const routes = {
      [routeKey]: {
        ...childs[0].props,
      },
    }
    const formatRoute = (route) => ({
      ...route,
    })
    props.addRoutes(routes, formatRoute)
  }
  render() {

    // this.props.setRoute({ type: routeKey })
    return <span>route</span>
  }
}

class Route extends Component {
  render() {
    return null
  }
}

const getRoutesMap = () => routesMap


const mapDispatchToProps = (dispatch) => ({
  addRoutes: (routes, formatRoute = null) => dispatch(Rudy.addRoutes(routes)),
  setRoute: (object) => dispatch(object)
})

const mapState = (state) => {
  return {}
}

const ConnectedRouter = connect(mapState, mapDispatchToProps)(Router)

export {
  Route,
  ConnectedRouter,
  getRoutesMap
}
