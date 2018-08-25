// @flow
/* eslint-disable no-console */
import type { Dispatch } from '../flow-types'

const logError: (type: string, error: any) => void = (
  type: string,
  error: any,
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('[rudy]', `action.type: ${type}`, error)
  } else if (process.env.NODE_ENV === 'test') {
    logCleanTestError([type], error)
  }
}

export default logError

const logCleanTestError = (
  args: Array<any>,
  error?: Object,
  shorten = true,
) => {
  const isLog = !error
  error = error || new Error()

  let stack: Array<string> = error.stack.split('\n')

  if (stack[1].indexOf('src/utils/logError.js') > -1) {
    stack.shift()
    stack.shift()
    if (shorten) stack.shift()
  }

  if (shorten) {
    const i = stack.findIndex((line) => line.indexOf('compose.js') > -1)
    stack = stack.slice(0, i)
  }

  let index = __dirname.indexOf('/src/')

  if (index === -1) {
    index = __dirname.indexOf('__tests__')
  }

  if (index === -1) {
    index = __dirname.indexOf('__helpers__')
  }

  if (index === -1) {
    index = __dirname.indexOf('__tests-helpers__')
  }

  const dir = __dirname.substr(0, index)
  const reg = new RegExp(dir, 'g')
  const trace = `\n${stack.join('\n').replace(reg, '')}`

  const message = isLog ? '' : 'RUDY ERROR:\n'

  if (args[0] && args[0].action) {
    console.log(message, args[0].action, trace)
  } else if (args.length === 1) {
    console.log(message, args[0], trace)
  } else if (args.length === 2) {
    console.log(message, args[0], args[1], trace)
  } else {
    console.log(message, args, trace)
  }
}

export const onError = ({
  errorType: type,
  error,
  dispatch,
}: Object): Dispatch => {
  logError(type, error)
  return dispatch({ type, error })
}

if (process.env.NODE_ENV === 'test') {
  global.log = (...args) => logCleanTestError(args)
  global.logFull = (arg) => logCleanTestError([arg], new Error(), false)
}
