export default (state = 'next', action = {}) => {
  const kind = action.location && action.location.kind
  return direction[kind] || state
}

const direction = {
  push: 'next',
  redirect: 'next',
  next: 'next',
  back: 'back'
}
// this is an example of some fun stuff you can do easily trigger animations
// from state. Look into <TransitionGroup /> within components/Switcher.js
