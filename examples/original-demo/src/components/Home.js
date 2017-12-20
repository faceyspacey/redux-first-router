import React from 'react'
import styles from '../css/Home'

const Home = () =>
  <div className={styles.home}>
    <h1>HOME</h1>

    <h2>
      NOTE: The top set of links are real links made like this:
    </h2>

    <span style={{ color: 'rgb(200,200,200)', marginTop: 20 }}>
      HREF STRING:
    </span>
    <span>{"<Link to='/list/db-graphql'>DB & GRAPHQL</Link>"}</span>

    <span style={{ color: 'rgb(200,200,200)', marginTop: 20 }}>
      PATH SEGMENTS:
    </span>
    <span>{"<Link to={['list', 'react-redux']}>REACT & REDUX</Link>"}</span>

    <span style={{ color: 'rgb(200,200,200)', marginTop: 20 }}>ACTION:</span>
    <span>
      {"<Link to={{ type: 'LIST', params: {slug: 'fp'} }}>FP</Link>"}
    </span>

    <h1 style={{ margin: 20 }}>EVENT HANDLERS DISPATCH ACTION</h1>

    <pre>
      {`
onClick: () => dispatch({
  type: 'LIST',
  params: { category: 'react-redux' }
})
      `}
    </pre>

    <div>
      <span style={{ color: '#c5af8f', display: 'inline' }}>DIRECTIONS: </span>
      <span className={styles.directions}>
        {`inspect the sidebar tabs to see the top set are real <a> tag links and the
        bottom set not, yet the address bar changes for both. The decision is up to you.
        When using the <Link /> component, if you provide an action as the \`href\` prop, you never
        need to worry if you change the static path segments (e.g: \`/list\`) in the routes passed
        to \`connectRoutes\`. ALSO: DON'T FORGET TO USE THE BROWSER BACK/NEXT BUTTONS TO SEE THAT WORKING TOO!`}
      </span>
    </div>

    <h1 style={{ marginTop: 25 }}>LINKS ABOUT REDUX-FIRST ROUTER:</h1>

    {'> '}
    <a
      className={styles.articleLinks}
      target='_blank'
      href='https://medium.com/faceyspacey/server-render-like-a-pro-w-redux-first-router-in-10-steps-b27dd93859de'
      rel='noopener noreferrer'
    >
      Server-Render Like A Pro in 10 Steps /w Redux-First Router 🚀
    </a>

    <br />
    <br />

    {'> '}
    <a
      className={styles.articleLinks}
      target='_blank'
      href='https://medium.com/faceyspacey/redux-first-router-lookin-sexy-on-code-sandbox-d9d9bea15053'
      rel='noopener noreferrer'
    >
      Things To Pay Attention To In This Demo
    </a>

    <br />
    <br />

    {'> '}
    <a
      className={styles.articleLinks}
      target='_blank'
      href='https://medium.com/faceyspacey/pre-release-redux-first-router-a-step-beyond-redux-little-router-cd2716576aea'
      rel='noopener noreferrer'
    >
      Pre Release: Redux-First Router — A Step Beyond Redux-Little-Router
    </a>

    <br />
    <br />

    {'> '}
    <a
      className={styles.articleLinks}
      target='_blank'
      href='https://medium.com/faceyspacey/redux-first-router-data-fetching-solving-the-80-use-case-for-async-middleware-14529606c262'
      rel='noopener noreferrer'
    >
      Redux-First Router data-fetching: solving the 80% use case for async
      Middleware
    </a>
  </div>

export default Home
