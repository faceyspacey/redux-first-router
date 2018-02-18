export default (req) => {
  const { error, errorType: type } = req
  const action = { type, error }

  if (process.env.NODE_ENV === 'development') {
    console.error('[rudy]', `action.type: ${type}`, error)
  }
  else if (process.env.NODE_ENV === 'test') {
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
    const trace = error.stack.replace(reg, '')

    console.log(`[RUDY ERROR]: action.type: ${type}\n`, trace)
  }

  return req.dispatch(action)
}
