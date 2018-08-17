export default (state = {}, action = {}) => {
  if (action.type === 'LIST_COMPLETE') {
    const { category, videos } = action.payload
    const slugs = videos.map(video => video.slug)
    return { ...state, [category]: slugs }
  }

  return state
}

// eg: { fp: ['slug-1', 'slug-2'], 'react-redux': ['slug-etc'] }
