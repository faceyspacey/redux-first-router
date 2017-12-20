export default (state = {}, action = {}) => {
  switch (action.type) {
    case 'LIST_COMPLETE': {
      const { videos } = action.payload
      return videos.reduce((videos, video) => {
        state[video.slug] = video
        return videos
      }, state)
    }
    case 'PLAY_COMPLETE':
    case 'VIDEO_COMPLETE': {
      const { slug, video } = action.payload
      state[slug] = video
      return state
    }
    default:
      return state
  }
}

// eg: { 'slug-1': video1, 'slug-2': video2 }
