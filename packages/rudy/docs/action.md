# Flux Standard Actions (FSA)

One of the goals of **Redux First Router** is to _NOT_ alter your actions and be
100% _flux standard action_-compliant. That allows for automatic support for
packages such as `redux-actions`.

So simply put, to do that, we stuffed all the info our middleware, reducer, etc,
depends on in the `meta` key of your actions.

Without further ado, let's take a look at what your actions look like--here's
our pure utility function, `nestAction()`, used to format and nest your actions:

## The Meta key is the _key_

_Note: If you or other middleware are making use of the `meta` key we'll make
sure to hold on to that info as well._

```javascript
const nestAction = (
  pathname: string,
  receivedAction: Action,
  prev: Location,
  kind?: string,
): Action => {
  const { type, payload = {}, meta } = receivedAction

  return {
    type, // this will remain exactly what you dispatched
    payload, // this will remain exactly what you dispatched

    // no additional keys!

    meta: {
      // all routing information crammed into the meta key
      ...meta,
      location: {
        current: {
          pathname,
          type,
          payload,
        },
        prev,
        kind,
      },
    },
  }
}
```

So in short, we take a more basic action you dispatch (or that the address-bar
listening enhancer dispatches) and assign all the location-related information
we have to the `location` key within the `meta` key.

## Flow Type

For an even clearer sense of what is on the `location` key of your _flux
standard actions_, here's its **_Flow_** type:

```javascript
type Action = {
  type: string,
  payload: Object,
  meta: Meta,
}

type Meta = {
  location: {
    current: Location,
    prev: Location,
    kind: 'load' | 'redirect' | 'back' | 'next' | 'pop',
  },
}

type Location = {
  pathname: string,
  type: string,
  payload: Object,
}
```

## Conclusion

You will rarely need to inspect the `meta` key. It's primarily for use by our
`location` reducer. However, a common use for it is to use the `kind` key to
make some determinations in your reducers. `pop` simply indicates the browser
back/next buttons were used, where as `back` and `next` indicate explicitly
which direction you were going, which we can determine when using
`createMemoryHistory` such as in React Native. In conjunction with `kind`, you
can use the `prev` route to do things like declaratively trigger fancy
animations in your components because it will indicate which direction the user
is moving in a funnel/sequence of pages.
