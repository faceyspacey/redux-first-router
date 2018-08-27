import { Request } from '@respond-framework/rudy/src/core/createRequest'
import createTest from '../../__helpers__/createTest'

createTest(
  'callback "req" argument has all goodies',
  {
    SECOND: {
      path: '/second',
      beforeEnter: (req) => {
        expect(req).toBeInstanceOf(Request)

        expect(req.tmp).toBeDefined()
        expect(req.ctx).toMatchObject({
          pending: { type: 'SECOND' },
          busy: true,
        })

        expect(req.routes).toBeDefined()
        expect(req.options).toBeDefined()
        expect(req.history).toBeDefined()

        expect(req.register).toBeDefined()
        expect(req.has).toBeDefined()

        expect(req.getTitle).toBeDefined()
        expect(req.getLocation).toBeDefined()

        expect(req.dispatch).toBeDefined()
        expect(req.getState).toBeDefined()

        expect(req.action).toMatchObject({ type: 'SECOND' })
        expect(req.route).toBeDefined()
        expect(req.prevRoute).toBeDefined()
        expect(req.error).toEqual(null)
        expect(req.scene).toEqual('')

        expect(req.realDispatch).toBeDefined()
        expect(req.commitHistory).toBeDefined()
        expect(req.commitDispatch).toBeDefined()

        expect(req.type).toBeDefined()
        expect(req.params).toBeDefined()
        expect(req.query).toBeDefined()
        expect(req.state).toBeDefined()
        expect(req.hash).toBeDefined()
        expect(req.basename).toBeDefined()
        expect(req.location).toBeDefined()

        expect(req.foo).toEqual(1)
        expect(req.bar).toEqual(2)
      },
      thunk: (req) => {
        expect(req.ctx).toMatchObject({ pending: false, busy: true })
        expect(req.tmp).toMatchObject({
          committed: true,
          load: undefined,
          revertPop: undefined,
        })
      },
    },
  },
  {
    extra: { foo: 1, bar: 2 },
  },
)
