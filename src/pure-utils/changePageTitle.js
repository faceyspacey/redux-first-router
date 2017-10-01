// @flow
import isServer from './isServer'

import type { Document } from '../flow-types'

export default (doc: Document, title: ?string): ?string => {
  if (typeof title === 'string' && doc.title !== title) {
    return (doc.title = title)
  }

  return null
}

export const getDocument = (): Document => (!isServer() ? document : {})
