import { doesRedirect } from '@respond-framework/rudy'
import configureStore from './configureStore.browser'

export default async (req, res) => {
  const { store, firstRoute } = configureStore(undefined, req.path)
  const result = await store.dispatch(firstRoute())
  if (doesRedirect(result, res)) return false

  const { status } = store.getState().location
  res.status(status)

  return store
}
