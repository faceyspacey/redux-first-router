import { notFound } from 'redux-first-router/actions'
import { fetchData } from './utils'

export default {
  HOME: '/',
  LIST: {
    path: '/list/:category',
    thunk: async ({ action, getState }) => {
      const { category } = action.params
      const { jwToken } = getState()
      const videos = await fetchData(`/api/videos/${category}`, jwToken)

      return videos.length > 0 ? { videos, category } : notFound()
    }
  },
  VIDEO: {
    path: '/video/:slug',
    thunk: async ({ action, getState }) => {
      const { slug } = action.params
      const { jwToken } = getState()
      const video = await fetchData(`/api/video/${slug}`, jwToken)

      return video ? { slug, video } : notFound()
    }
  },
  PLAY: {
    path: '/video/:slug/play',
    thunk: 'VIDEO'
  },
  LOGIN: '/login',
  ADMIN: {
    path: '/admin', // TRY: visit this path or dispatch ADMIN
    role: 'admin' // + change jwToken to 'real' in server/index.js
  }
}

