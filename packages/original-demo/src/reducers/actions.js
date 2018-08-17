export default (state = [], action = {}) => {
  if (action.type === '@@redux/INIT' || action.type === '@@INIT') {
    return state
  }

  return [action, ...state]
}

// NOTE: this isn't a reducer you are likely to have in your app, since it's
// for "devTools." Don't worry that it does some weird things. The reason is:
// since we have SSR, we don't want these actions displayed in HTML
// or checksums won't match up since the server doesnt have them,
// but usually you don't send an array of actions over the wire.
