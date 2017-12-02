export default (req, state) =>
  req.action.location.url === state.url
  && req.action.location.basename === state.basename
  && state.kind !== 'init' // on load, the `firstRoute` action will trigger the same URL as stored in state, and we need to dispatch it anyway :)
  && req.action.location.kind !== 'setState'
  && req.action.info !== 'reset'
