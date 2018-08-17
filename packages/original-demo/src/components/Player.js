import React from 'react'
import { connect } from 'react-redux'
import Link from 'redux-first-router-link'

import styles from '../css/Video'

const Player = ({ playing, youtubeId, slug, color }) =>
  !playing
    ? <div
      className={styles.heroContainer}
      style={{ backgroundImage: youtubeBackground(youtubeId) }}
    >
      <Link to={`/video/${slug}/play`}>
        <span className='ion-play' style={{ backgroundColor: color }} />
      </Link>
    </div>
    : <iframe
      className={styles.iframe}
      frameBorder='0'
      allowFullScreen
      src={youtubeIframeSrc(youtubeId)}
    />

const youtubeBackground = youtubeId =>
  `url(https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg)`

const youtubeIframeSrc = youtubeId =>
  `https://www.youtube.com/embed/${youtubeId}?playlist=${youtubeId}&autoplay=1&rel=0&theme=dark&loop=1&color=white&controls=2&autohide=1&showinfo=0`

export default connect(({ playing }) => ({ playing }))(Player)
