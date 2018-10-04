# URL parsing

Besides the simple option of matching a literal path, all matching capabilities of the `path-to-regexp` package we use are now supported,  *except* [unnamed parameters](https://github.com/pillarjs/path-to-regexp#unnamed-parameters).

Let's go through what we support. Usually it's best to start with the simplest example, but I think most people looking at this get this stuff. We'll start with one of the more complicated use cases just to see how far we can take this:

## Multi Segment Parameters

So for example, imagine you're github.com and you're now using Redux-First Router :),  and you need to match all the potential dynamic paths for files in repos, here's how you do it:

```js
const routesMap = {
   REPO: '/:user/:repo/block/:branch/:filePath+'
}
```

So that will match:
- https://github.com/faceyspacey/redux-first-router/blob/master/src/connectRoutes.js
- https://github.com/faceyspacey/redux-first-router/blob/master/src/pure-utils/pathToAction.js
- etc

but not:
- https://github.com/faceyspacey/redux-first-router/blob/master

And if you visit that URL, you will see it in fact doesn't exist. If it did, you would use an asterisk (for 0 or more matches as in regexes) like so:

```js
const routesMap = {
   REPO: '/:user/:repo/block/:branch/:filePath*'
}
```

So the above 2 options will match a varying number of path segments. Here's what a corresponding action might look like:


```js
const action = {
   type: 'REPO',
   payload: {
       user: 'faceyspacey',
       repo: 'redux-first-router',
       branch: 'master',
       filePath: 'src/pure-utils/pathToAction.js'
   }
}
```

Pretty cool, eh! 

> The inspiration actually came from a [PR](https://github.com/CompuIves/codesandbox-client/pull/49) I did to CodeSandBox. I didn't actually implement this there, but I was thinking about it around that time. I.e. that CodeSandBox should have the full file paths in the URLs like github. Currently it's as a URL-encoded query param, but in the future *(perhaps with RFR)*, they'll be able to do what Github does as well.

## Optional Single Segment Parameters

However, you usually just want to add optional *single segment* params like this:

```js
const routesMap = {
   ISSUES: '/:user/:repo/issues/:id?'
}
```

So with that you can visit both:
- `https://github.com/faceyspacey/redux-first-router/issues`
- `https://github.com/faceyspacey/redux-first-router/issues/83`

Here's the 2 actions that would match that respectively:

- `const action = {  type: 'ISSUES' }`
- `const action = {  type: 'ISSUES', payload: { id: 83} }`

And that's basically the *"80% use-case"* most powerful feature here. I.e. when you want to use the same type for a few similar URLs, while getting an optional parameter.

> note: you can also have optional params in the middle, eg: `/foo/:optional?/bar/:anotherOptional?` So all 3 of `/foo/bla/bar/baz` and `/foo/bar/baz` and `/foo/bar` will match :)

## Optional Static Segments ("aliases")

The absolute most common *(and simpler*) use case for such a thing is when you want `/items` and `/items/list` to have the same type **(because they are aliases of each other )**. You accomplish it slightly differently:

```js
const routesMap = {
  HOME: '/home/(list)?',
}
```

or

```js
const routesMap = {
  HOME: '/home/(list)*',
}
```

Both are the same. It would be nice if you didn't have to wrap `list` in parentheses, but you have to. That's fine. *Keep in mind this isn't a parameter; the 2nd path segment has to be `list` or not be there.*

Also, the common convention we should use is the the question mark `?` instead of the asterisk `*`. We should reserve the asterisk for where it has unique capabilities, specifically the ability to match a varying number of path segments (along with `+`) as in the initial examples with the github file paths.

## Regexes

Another thing to note about the last one is that `(list)` is in fact a regex. So you can use regexes to further refine what paths match. You can do so with parameter segments as well:

```js
const routesMap = {
  HOME: '/posts/:id(\\d+)',
}
```

So essentially you follow a dynamic segment with a regex in parentheses and the param will have to match the regex. So this would match:
- `/posts/123`
but this wouldn't:
- `/posts/foo-bar`


## Multiple *Multi Segment Parameters*
Last use case: say you want to have multiple params with a varying number of segments. Here's how you do it:

```js
const routesMap = {
  HOME: '/home/:segments1+/bla/:segments2+',
}
```

So a url like `/home/foo/bar/bla/baz/bat/cat` will result in an `action` like this:

```js
const action = {
   type: 'HOME',
   payload: {
       segments1: 'foo/bar',
       segments2: 'baz/bat/cat'
   }
}
```

So yes, you can have multiple *"multi segments parameters"*.

One thing to note is you could also accomplish this like this: `HOME: '/home/:segments1(.*)/bla/:segments2(.*)'`.

----

Final reminder: if you do plan to use *multi segment parameters*, they have to be named. This won't work:
`/home/(.*)/bla/(.*)`.

Well, the truth is it will, and given the previous URL you will have a payload of:

```js
const action = {
   type: 'HOME',
   payload: {
       0: 'foo/bar',
       1: 'baz/bat/cat'
   }
}
```

But consider that "undefined" functionality. Don't rely on that. Name your segments! Like any other key in your payload. That's the goal here. Originally I had the idea of making an array at `payload.segments`, but then I realized it was possible to name them. So naming all params is the RFR way.
