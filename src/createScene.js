// @flow
import type { RoutesMapInput, CreateActionsOptions } from './flow-types'
import notFound from './action-creators/notFound'
import { NOT_FOUND } from './index'
import isFSRA from './utils/isFSRA'
import isNotFound from './utils/isNotFound'

export default (r: RoutesMapInput, options: CreateActionsOptions = {}) => {
  const { scene: sc, basename: bn, logExports } = options

  const scene = sc || ''
  const prefix = scene ? `${scene}/` : ''
  const keys = Object.keys(r)

  const result = keys.reduce((result, t) => {
    const { types, actions, routes } = result

    const type = `${prefix}${t}`
    const typeComplete = `${prefix}${t}_COMPLETE`
    const typeError = `${prefix}${t}_ERROR`

    const route = routes[type] = routeToObject(r[t], type)
    const tClean = route.scene ? type.replace(`${route.scene}/`, '') : t // strip the scene so keys/exports are un-prefixed
    const name = camelCase(tClean)

    types[tClean] = type
    types[`${tClean}_COMPLETE`] = `${prefix}${t}_COMPLETE`
    types[`${tClean}_ERROR`] = `${prefix}${t}_ERROR`

    actions[name] = makeActionCreator(type, routes, bn)
    actions[`${name}Complete`] = makeActionCreator(typeComplete, routes, bn)
    actions[`${name}Error`] = makeErrorActionCreator(typeError, bn)

    return result
  }, { types: {}, actions: {}, routes: {} })

  const { types, actions } = result

  // insure @@rudy/NOT_FOUND keys/exports are also un-prefixed, eg: NOT_FOUND, notFound, etc
  if (types[NOT_FOUND]) {
    types.NOT_FOUND = types[NOT_FOUND]
    types.NOT_FOUND_COMPLETE = types[`${NOT_FOUND}_COMPLETE`]
    types.NOT_FOUND_ERROR = types[`${NOT_FOUND}_ERROR`]
    delete types[NOT_FOUND]
    delete types[`${NOT_FOUND}_COMPLETE`]
    delete types[`${NOT_FOUND}_ERROR`]

    actions.notFound = actions.rudyNotFound
    actions.notFoundComplete = actions.rudyNotFoundComplete
    actions.notFoundError = actions.rudyNotFoundError
    delete actions.rudyNotFound
    delete actions.rudyNotFoundComplete
    delete actions.rudyNotFoundError
  }

  if (logExports && /development|test/.test(process.env.NODE_ENV)) {
    result.exportString = logExportString(types, actions)
  }

  return result
}

const routeToObject = (route, type) => {
  const r = typeof route === 'function'
    ? { thunk: route }
    : typeof route === 'string'
      ? { path: route }
      : route

  r.scene = getScene(type)

  // set default path for NOT_FOUND actions if necessary
  if (!r.path && isNotFound(type)) {
    r.path = r.scene ? `/${r.scene.toLowerCase()}/not-found` : '/not-found'
  }

  return r
}

const getScene = (type: string) => {
  const i = type.lastIndexOf('/')
  return type.substr(0, i).replace(/\/?@@rudy/, '')
}

const makeActionCreator = (type: string, routes: RoutesMapInput, basename: ?string) => {
  const ac = routes[type] && routes[type].action

  // `info` arg contains 'isThunk' or optional `path` for `notFound` action creators
  const defaultCreator = (arg: Object | Function, info: ?string) => {
    // optionally handle action creators that return functions (aka `thunk`)
    if (typeof arg === 'function') {
      const thunk: Function = arg
      return (...args: Array<any>) => defaultCreator(thunk(...args, type), 'isThunk')
    }

    // do nothing if a `thunk` returned nothing (i.e. manually used `dispatch`)
    if (info === 'isThunk' && arg === undefined) return

    // for good measure honor promises (`dispatch` will have manually been used)
    if (info === 'isThunk' && arg && arg.then) return arg

    // use built-in `notFound` action creator if `NOT_FOUND` type
    const t = (arg && arg.type) || type
    if (isNotFound(t)) {
      const notFoundPath = info === 'isThunk' ? null : info
      return notFound(arg, notFoundPath, basename, t)
    }

    // the default behavior of transforming an `arg` object into an action with its type
    if (isFSRA(arg)) return { type, ...arg, meta: { basename, ...arg.meta } }

    // if no `payload`, `query`, etc, treat arg as a `payload` for convenience
    return { type, payload: arg || {}, meta: { basename } }
  }

  // optionally allow custom action creators
  if (ac) {
    return (...args: Array<any>) => defaultCreator(ac(...args, type))
  }

  // primary use case: generate an action creator (will only trigger last lines of `defaultCreator`)
  return defaultCreator
}


const logExportString = (types, actions) => {
  let t = ''
  for (const type in types) t += `\n\t${type},`

  let a = ''
  for (const action in actions) a += `\n\t${action},`

  // destructure createActions()
  let exports = 'const { types, actions } = createActions(routes)'
  exports += '\n\nconst { ' + t.slice(0, -1) + '\n} = types'
  exports += '\n\nconst { ' + a.slice(0, -1) + '\n} = actions'

  // types exports
  exports += '\n\nexport {' + t
  exports = exports.slice(0, -1) + '\n}'

  // actions exports
  exports += '\n\nexport {' + a
  exports = exports.slice(0, -1) + '\n}'

  if (process.env.NODE_ENV !== 'test') console.log(exports)
  return exports
}

const makeErrorActionCreator = (type: string, basename: ?string) => {
  return (o: Object) => o && o.error
    ? { type, ...o, meta: { basename, ...o.meta } }
    : { type, error: o, meta: { basename } }
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
