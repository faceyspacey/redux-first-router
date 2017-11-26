import { NOT_FOUND, doesRedirect } from 'redux-first-router'
import configureStore from '../src/configureStore'

export default async (req, res) => {
  const { store, firstRoute } = configureStore(undefined, req.path)

  const result = await store.dispatch(firstRoute()) // THE PAYOFF BABY!

  const cb = (status, url) => res.redirect(status, url)
  if (doesRedirect(result, cb)) return false

  const { location: { type } } = store.getState()
  const status = type === NOT_FOUND ? 404 : 200
  res.status(status)

  return store
}

