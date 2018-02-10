import createTest from '../../__helpers__/createTest'

createTest('cached thunk only called once', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })
  await snap({ type: 'SECOND' })
})


createTest('options.createCacheKey', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, {
  createCacheKey: (action, name) => {
    return action.type
  }
}, [], async ({ snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })
  await snap({ type: 'SECOND' })
})

createTest('cache.clear()', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ cache }) => {
    cache.clear()
  })

  await snap({ type: 'SECOND' })
})

createTest('cache.clear(string)', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ cache }) => {
    cache.clear('SECOND')
  })

  await snap({ type: 'SECOND' })
})

createTest('cache.clear(action)', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ cache }) => {
    cache.clear({ type: 'SECOND' })
  })

  await snap({ type: 'SECOND' })
})

createTest('cache.clear(action, { name: "thunk" })', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ cache }) => {
    cache.clear({ type: 'SECOND' }, { name: 'thunk' })
  })

  await snap({ type: 'SECOND' })
})

createTest('cache.clear(func)', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ cache }) => {
    cache.clear((cache, api, opts) => {
      return {}
    })
  })

  await snap({ type: 'SECOND' })

  await dispatch(({ cache }) => {
    cache.clear((cache, api, opts) => {
      for (const key in cache) delete cache[key]
    })
  })

  await snap({ type: 'FIRST' })

  await snap({ type: 'SECOND' })
})

createTest('route.cache === false', {
  SECOND: {
    path: '/second',
    cache: false,
    thunk: function() {}
  }
}, [], async ({ snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })
  await snap({ type: 'SECOND' })
})

createTest('options.cache === false', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, {
  cache: false
}, [], async ({ snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })
  await snap({ type: 'SECOND' })
})
