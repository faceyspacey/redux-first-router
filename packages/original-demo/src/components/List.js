import React from 'react'
import { connect } from 'react-redux'
import Link from 'redux-first-router-link'

import styles from '../css/List'

const List = ({ videos }) =>
  <div className={styles.list}>
    {videos.map((video, key) => <Row {...video} key={key} />)}
  </div>

const Row = ({ slug, title, youtubeId, by, color }) =>
  <Link
    className={styles.row}
    to={`/video/${slug}`}
    style={{ backgroundImage: youtubeBackground(youtubeId) }}
  >
    <div className={styles.avatar} style={{ backgroundColor: color }}>
      {initials(by)}
    </div>
    <span className={styles.title}>{title}</span>

    <div className={styles.gradient} />
    <span className={styles.by}>by: {by}</span>
  </Link>

const youtubeBackground = youtubeId =>
  `url(https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg)`

const initials = by => by.split(' ').map(name => name[0]).join('')

const mapState = ({ category, videosByCategory, videosHash }) => {
  const slugs = videosByCategory[category] || []
  const videos = slugs.map(slug => videosHash[slug])
  return { videos }
}
export default connect(mapState)(List)
