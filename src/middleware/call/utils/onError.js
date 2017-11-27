export default (req) => {
  const { error, errorType: type } = req
  const action = { type, error }

  if (process.env.NODE_ENV === 'development') {
    console.error('[rudy]', `action.type: ${type}`, error)
  }

  return [action]
}
