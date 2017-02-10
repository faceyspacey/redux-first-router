// @no-flow
// `CONFIG` global currently causes flow errors in user code
// see: http://stackoverflow.com/questions/42154415/in-flow-npm-packages-whats-the-proper-way-to-suppress-issues-so-user-apps-don

import type { Document } from '../flow-types'


export default (doc: Document, title: string): ?string => {
  if (typeof title === 'string' && doc.title !== title) {
    return doc.title = title
  }

  return null
}


export const getDocument = (): Document => {
  const isSSRTest = process.env.NODE_ENV === 'test'
    && typeof CONFIG !== 'undefined' && CONFIG.isSSR

  return typeof document !== 'undefined' && !isSSRTest
    ? document
    : {}
}
