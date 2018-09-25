import { isServer } from '../utils'

export default (api) => async (req, next) => {
  const title = req.getTitle()

  if (!isServer() && typeof title === 'string') {
    // eslint-disable-next-line no-undef
    window.document.title = title
  }

  return next()
}
