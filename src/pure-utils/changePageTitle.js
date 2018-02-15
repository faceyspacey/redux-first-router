// @flow
import type { Document } from '../flow-types'

export default (doc: Document, title: ?string): ?string => {
  if (typeof title === 'string' && doc.title !== title) {
    return (doc.title = title)
  }

  return null
}

export const getDocument = (): Document => {
  const isSSRTest = process.env.NODE_ENV === 'test' && typeof window !== 'undefined' && window.isSSR

  return typeof document !== 'undefined' && !isSSRTest ? document : {}
}
