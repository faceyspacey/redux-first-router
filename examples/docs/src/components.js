import React from 'react'
import { connect } from 'react-redux'

const Home = () => <h3>Home</h3>

const User = ({ userId }) => <h3>{`User ${userId}`}</h3>
const mapStateToProps = ({ location }) => ({
  userId: location.payload.id
})
const ConnectedUser = connect(mapStateToProps)(User)

const NotFound = () => <h3>404</h3>


export { Home, ConnectedUser as User, NotFound }

