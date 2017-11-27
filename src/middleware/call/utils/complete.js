// insure response is returned after awaiting next()
export default (next) => (res) => next().then(() => res)
