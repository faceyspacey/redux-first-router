// @flow
export const PREFIX = '@@rudy'
export const prefixType = (type: string) => `${PREFIX}/${type}`

export const UPDATE_HISTORY = prefixType('UPDATE_HISTORY')
export const NOT_FOUND = prefixType('NOT_FOUND')
export const ADD_ROUTES = prefixType('ADD_ROUTES')
export const CLEAR_CACHE = prefixType('CLEAR_CACHE')
