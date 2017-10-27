export default (listeners = []) => ({
  notify: (bag, notify = true) => {
    bag.commit = once(bag.commit)

    if (notify) {
      // listeners.forEach(listener => listener(bag))
      return listeners[0](bag)
    }

    return bag
  },
  add: fn => {
    // we need `isActive` in addition to filtering, to fix multi-listener bug:
    // https://github.com/ReactTraining/history/commit/817af4423e76fa71db95fd094881b39abbfd99fe#diff-6f45a74cf5bd28187670b1f6a2add4da
    let isActive = true

    const listener = (...args) => {
      if (isActive) return fn(...args)
    }

    listeners.push(listener)

    const unlisten = () => {
      isActive = false
      listeners = listeners.filter(item => item !== listener)
    }

    return unlisten
  }
})

const once = commit => {
  let committed = false

  return () => {
    if (committed) return
    committed = true
    commit()
  }
}
