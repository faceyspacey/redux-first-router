import { createSelector } from 'reselect'

export default createSelector(
  [
    state => state.location.type,
    state => state.location.params,
    state => state.videosHash,
    state => state.videosByCategory
  ],
  (type, { slug, category }, hash1, hash2) => {
    if (type === 'VIDEO') return !hash1[slug]
    if (type === 'LIST') return !hash2[category]
  }
)
