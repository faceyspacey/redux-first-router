export default (cb) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(cb), 1)
  })
