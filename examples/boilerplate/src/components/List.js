import React from 'react'
import { connect } from 'react-redux'
import ArticlePromotion from './ArticlePromotion'

import styles from '../css/List'

const List = ({ category, packages }) => (
  <div className={styles.list}>
    <div className={styles.title}>Category: {category}</div>

    <div className={styles.content}>
      <ul>{packages.map(pkg => <li key={pkg}>{pkg}</li>)}</ul>

      {category === 'redux' ? (
        <ArticlePromotion
          title='Wanna master data-fetching? Read:'
          text='Redux-First Router data-fetching: solving the 80% use case for async Middleware 🚀'
          url='https://medium.com/faceyspacey/redux-first-router-data-fetching-solving-the-80-use-case-for-async-middleware-14529606c262'
        />
      ) : (
        <ArticlePromotion
          title='New to Rudy?? Learn how it started and its motivation:'
          text='Pre Release: Redux-First Router — A Step Beyond Redux-Little-Router 🚀'
          url='https://medium.com/faceyspacey/pre-release-redux-first-router-a-step-beyond-redux-little-router-cd2716576aea'
        />
      )}
    </div>
  </div>
)

const mapStateToProps = state => ({
  category: state.category,
  packages: state.packages
})

export default connect(mapStateToProps)(List)
