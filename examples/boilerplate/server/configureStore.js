import { doesRedirect } from 'rudy/utils'
import configureStore from '../src/configureStore'

export default async (req, res) => {
  const { store, firstRoute } = configureStore(undefined, req.path)
  // const result = await store.dispatch(firstRoute())

  // if (doesRedirect(result, res)) return false

  const { status } = store.getState().location
  res.status(status)

  return store
}

