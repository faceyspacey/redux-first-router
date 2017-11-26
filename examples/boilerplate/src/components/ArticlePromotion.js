import React from 'react'
import styles from '../css/App'

export default ({ title, text, url }) =>
  <div>
    <div className={styles.more}>{title}</div>

    <a
      className={styles.link}
      href={url}
      target='_blank'
      rel='noopener noreferrer'
    >
      {text}
    </a>
  </div>
