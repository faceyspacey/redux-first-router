import { NOT_FOUND } from 'redux-first-router/types'

// try dispatching these from the redux devTools

export const goToPage = (type, category) => ({
  type,
  params: category && { category }
})

export const goHome = () => ({
  type: 'HOME'
})

export const goToAdmin = () => ({
  type: 'ADMIN'
})

export const notFound = () => ({
  type: NOT_FOUND
})

export const visitCategory = category => ({
  type: 'LIST',
  params: { category }
})

export const visitVideo = slug => ({
  type: 'VIDEO',
  params: { slug }
})
