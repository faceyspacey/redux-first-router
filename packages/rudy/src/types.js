// @flow
export const PREFIX = '@@rudy'
export const prefixType = (type: string, prefix?: string) =>
  `${prefix || PREFIX}/${type}`

export const CALL_HISTORY = prefixType('CALL_HISTORY')
export const NOT_FOUND = prefixType('NOT_FOUND')
export const ADD_ROUTES = prefixType('ADD_ROUTES')
export const CHANGE_BASENAME = prefixType('CHANGE_BASENAME')
export const CLEAR_CACHE = prefixType('CLEAR_CACHE')

export const CONFIRM = prefixType('CONFIRM')
export const BLOCK = prefixType('BLOCK', '@@skiprudy') // these skip middleware pipeline, and are reducer-only
export const UNBLOCK = prefixType('UNBLOCK', '@@skiprudy')

export const SET_FROM = prefixType('SET_FROM', '@@skiprudy')
