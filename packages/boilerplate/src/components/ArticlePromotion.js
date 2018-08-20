import React from 'react'
import { hot } from 'react-hot-loader'
import styles from '../css/App'

export default hot(module)(({ title, text, url }) => (
  <div>
    <div className={styles.more}>{title}</div>

    <a
      className={styles.link}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {text}
    </a>
  </div>
))
