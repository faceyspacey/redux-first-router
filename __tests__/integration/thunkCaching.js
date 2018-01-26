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

createTest('clearCache()', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ clearCache }) => {
    clearCache()
  })

  await snap({ type: 'SECOND' })
})

createTest('clearCache(string)', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ clearCache }) => {
    clearCache('SECOND')
  })

  await snap({ type: 'SECOND' })
})

createTest('clearCache(action)', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ clearCache }) => {
    clearCache({ type: 'SECOND' })
  })

  await snap({ type: 'SECOND' })
})

createTest('clearCache(action, { name: "thunk" })', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ clearCache }) => {
    clearCache({ type: 'SECOND' }, { name: 'thunk' })
  })

  await snap({ type: 'SECOND' })
})

createTest('clearCache(func)', {
  SECOND: {
    path: '/second',
    thunk: function() {}
  }
}, [], async ({ dispatch, snap }) => {
  await snap({ type: 'SECOND' })
  await snap({ type: 'FIRST' })

  await dispatch(({ clearCache }) => {
    clearCache((cache, api, opts) => {
      return {}
    })
  })

  await snap({ type: 'SECOND' })

  await dispatch(({ clearCache }) => {
    clearCache((cache, api, opts) => {
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
