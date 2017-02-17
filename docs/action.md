# Flux Standard Actions (FSA)
One of the goals of **Pure Redux Router** is to *NOT* alter your actions and be 100% *flux standard action*-compliant.
So simply put, to do that, we stuffed all the info our middleware, reducer, etc, needs in the `meta` key of your actions.

Without further ado, let's take a look at what your actions look like--here's our pure utility function, `nestAction()`, used to format 
and nest your actions:


## The Meta key is the *key*
*Note: If you or other middleware are making use of the `meta` key we'll make sure to hold on to that info as well.*

```javascript
const nestAction = (
  pathname: string,
  receivedAction: Action,
  prev: Location,
  kind?: string,
): Action => {
  const { type, payload = {}, meta } = receivedAction

  return {
    type,
    payload,
    meta: {
      ...meta,
      location: {
        current: {
          pathname,
          type,
          payload,
        },
        prev,
        load: kind === 'load' ? true : undefined,
        backNext: kind === 'backNext' ? true : undefined,
      },
    },
  }
}
```

So in short, we take a more basic action you dispatch (or that the address-bar listening enhancer dispatches) and assign 
all the location-related information we have to its meta key.

## Flow Type
For an even clearer sense of what is on the `meta` key of your *flux standard actions*, here's its ***Flow*** type:

```javascript
type Action = {
  type: string,
  payload: Object,
  meta?: Meta,
}

type Meta = {
  location: {
    current: Location,
    prev: Location,
    load?: true,
    backNext?: true,
  },
}

type Location = {
  pathname: string,
  type: string,
  payload: Object,
}
```
