import createTest from '../../__helpers__/createTest'
import { Request } from '../../src/core/createRequest'

createTest('callback "req" argument has all goodies', {
  SECOND: {
    path: '/second',
    beforeEnter: (req) => {
      expect(req.tmp).toBeDefined()
      expect(req.routes).toBeDefined()
      expect(req.history).toBeDefined()
      expect(req.options).toBeDefined()
      expect(req.register).toBeDefined()
      expect(req.has).toBeDefined()
      expect(req.getTitle).toBeDefined()
      expect(req.getLocation).toBeDefined()
      expect(req.dispatch).toBeDefined()
      expect(req.getState).toBeDefined()

      expect(req.foo).toEqual(1)
      expect(req.bar).toEqual(2)

      expect(req.action).toMatchObject({ type: 'SECOND' })
      expect(req.tmp).toBeDefined()
      expect(req.ctx).toMatchObject({ pending: { type: 'SECOND' }, busy: true })
      expect(req.route).toBeDefined()
      expect(req.prevRoute).toBeDefined()
      expect(req.error).toEqual(null)
      expect(req.commitHistory).toBeDefined()
      expect(req.commitDispatch).toBeDefined()

      expect(req).toBeInstanceOf(Request)
    },
    thunk: (req) => {
      expect(req.ctx).toMatchObject({ pending: false, busy: true })
      expect(req.tmp).toMatchObject({
        committed: true,
        from: { type: 'SECOND' }
      })
    }
  }
}, {
  extra: { foo: 1, bar: 2 }
})
