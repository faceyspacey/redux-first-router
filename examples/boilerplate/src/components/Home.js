import React from 'react'

import ArticlePromotion from './ArticlePromotion'

import styles from '../css/Home'

const Home = () => (
  <div className={styles.home}>
    <h1 className={styles.title}>HOME</h1>

    <div className={styles.content}>
      <img
        alt='logo'
        style={{ height: 300 }}
        src='https://cdn.reactlandia.com/rudy-logo.png'
      />

      <span className={styles.caption}>RFR will become Rudy</span>

      <ArticlePromotion
        title='Wanna master SSR? Read:'
        text='Server-Render Like a Pro in 10 Steps /w Redux-First Router 🚀'
        url='https://medium.com/faceyspacey/server-render-like-a-pro-w-redux-first-router-in-10-steps-b27dd93859de'
      />
    </div>

    <a
      target='_blank'
      className={styles.nico}
      rel='noopener noreferrer'
      href='https://twitter.com/nico__delfino'
    >
      *One of our first users, Nicolas Delfino, designed the logo, check him
      out: @nico__delfino
    </a>
  </div>
)

export default Home
