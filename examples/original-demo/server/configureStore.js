import { doesRedirect } from 'redux-first-router/utils'
import configureStore from '../src/configureStore'

export default async (req, res) => {
  const jwToken = req.cookies.jwToken // see server/index.js to change jwToken
  const preLoadedState = { jwToken }  // onBeforeChange will authenticate using this

  const { store, firstRoute } = configureStore(preLoadedState, req.path)
  const result = await store.dispatch(firstRoute())

  if (doesRedirect(result, res)) return false

  const { status } = store.getState().location
  res.status(status)

  return store
}


