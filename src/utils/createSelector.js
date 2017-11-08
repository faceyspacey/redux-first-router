export default (name, selector) =>
  typeof selector === 'function'
    ? selector
    : selector ? state => state[selector] : state => state[name]
