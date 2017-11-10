// @flow
import type { RoutesMapInput } from './flow-types'
import { NOT_FOUND } from './index'

export default (routes: RoutesMapInput) => {
  routes[NOT_FOUND] = routes[NOT_FOUND] || {}
  routes[NOT_FOUND].path = routes[NOT_FOUND].path || '/not-found'

  const keys = Object.keys(routes)
  const types = keys.reduce((types, type) => {
    const typeComplete = `${type}_COMPLETE`
    types[type] = type
    types[typeComplete] = typeComplete
    return types
  }, {})

  const actionCreators = keys.reduce((actionCreators, type) => {
    const name = camelCase(type)
    const typeComplete = `${type}_COMPLETE`
    actionCreators[name] = makeActionCreator(type, routes)
    actionCreators[`${name}Complete`] = makeActionCreator(typeComplete, routes)
    return actionCreators
  }, {})

  types.NOT_FOUND = types[NOT_FOUND]
  delete types[NOT_FOUND]
  delete types[`${NOT_FOUND}_COMPLETE`]

  actionCreators.notFound = types.rudyNotFound
  delete types.rudyNotFound

  return { types, actionCreators }
}


const makeActionCreator = (type: string, routes: RoutesMapInput) => {
  const ac = routes[type] && routes[type].actionCreator

  const defaultCreator = (arg: Object | Function) => {
    // optionally handle action creators that return functions (aka `thunk`)
    if (typeof arg === 'function') {
      const thunk: Function = arg
      return (...args: Array<any>) => defaultCreator(thunk(...args, type))
    }

    // do nothing if a `thunk` returned nothing (i.e. manually used `dispatch`)
    if (arg === undefined) return

    // for good measure honor promises
    if (arg.then) return arg

    // the default behavior of transforming an `arg` object into an action with its type
    if (arg.payload || arg.query || arg.state || arg.error) {
      return { type, ...arg }
    }

    const payload = arg // if no `payload`, `query`, etc, treat it as a `payload` for convenience
    return { type, payload }
  }

  // optionally allow custom action creators
  if (ac) {
    return (...args: Array<any>) => defaultCreator(ac(...args, type))
  }

  // primary use case: generate an action creator (will only trigger last lines of `defaultCreator`)
  return defaultCreator
}

const camelCase = (type: string) => {
  const matches = type.match(wordPattern)

  if (!Array.isArray(matches)) throw new Error(`[rudy] invalid action type: ${type}`)

  return matches.reduce((camelCased, word, index) =>
    camelCased + (index === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
  , '')
}

const wordPattern = /[A-Z\xc0-\xd6\xd8-\xde]?[a-z\xdf-\xf6\xf8-\xff]+(?:['’](?:d|ll|m|re|s|t|ve))?(?=[\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000]|[A-Z\xc0-\xd6\xd8-\xde]|$)|(?:[A-Z\xc0-\xd6\xd8-\xde]|[^\ud800-\udfff\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\d+\u2700-\u27bfa-z\xdf-\xf6\xf8-\xffA-Z\xc0-\xd6\xd8-\xde])+(?:['’](?:D|LL|M|RE|S|T|VE))?(?=[\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000]|[A-Z\xc0-\xd6\xd8-\xde](?:[a-z\xdf-\xf6\xf8-\xff]|[^\ud800-\udfff\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\d+\u2700-\u27bfa-z\xdf-\xf6\xf8-\xffA-Z\xc0-\xd6\xd8-\xde])|$)|[A-Z\xc0-\xd6\xd8-\xde]?(?:[a-z\xdf-\xf6\xf8-\xff]|[^\ud800-\udfff\xac\xb1\xd7\xf7\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xbf\u2000-\u206f \t\x0b\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\d+\u2700-\u27bfa-z\xdf-\xf6\xf8-\xffA-Z\xc0-\xd6\xd8-\xde])+(?:['’](?:d|ll|m|re|s|t|ve))?|[A-Z\xc0-\xd6\xd8-\xde]+(?:['’](?:D|LL|M|RE|S|T|VE))?|\d*(?:(?:1ST|2ND|3RD|(?![123])\dTH)\b)|\d*(?:(?:1st|2nd|3rd|(?![123])\dth)\b)|\d+|(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe2f\u20d0-\u20ff]|\ud83c[\udffb-\udfff])?)*/g
