# Secret API
The following are basically advanced features you should only use if you have a really good reason to do so.

## Declarative & Imperative History Functionality
The `location` state and the `action.meta.location` object *on the server or in environments where you used `createMemoryHistory`
to create your history* will also maintain the ***declarative*** information about the history stack. It can be found within the `history` key, and this 
is its shape:

```javascript
history: {
  index: number,          // index of focused entry/path
  length: number,         // total # of entries/paths
  entries: Array<string>, // array of paths obviously
}
```

Funnily enough, it can't be consistently maintained in the browser. Here's why:

[would it be possible for createBrowserHistory to also have entries and index? #441](https://github.com/ReactTraining/history/issues/441)

In short, the browser will maintain the history for your website even if you refresh the page, whereas from our app's perspective,
if that happens, we'll lose awareness of the history stack. `sessionStorage` almost can solve the issue, but because of various
browser inconsitencies (e.g. when cookies are blocked, you can't recall `sessionStorage`), it becomes unreliable and therefore
not worth it. 

***When might I have use for it though?***

Well, you see the fake browser we made in our playground on *webpackbin*, right? We emulate the browser's back/next buttons
using it. If you have the need to make such a demo or something similar, totally use it--we plan to maintain the secret API.

In addition to the declarative state above, here's the ***imperative*** methods we used to make that fake browser (these methods are available on *both the client and the server*):

```javascript
import { push, replace, back, next } from 'redux-first-router'
```
* **push:** (path) => void
* **replace:** (path) => void
* **back:** () => void
* **next:** () => void

*note: do NOT rely on these methods on the server, as they do not make use of enclosed* ***per request*** *state. If you must, use the corresponding
methods on the `history` object you create per request which you pass to `connectRoutes(history`). See the [history package's docs](https://github.com/ReactTraining/history)
for more info.*


## `actionToPath` and `pathToAction`
These methods are also exported:

```javascript
import { actionToPath, pathToAction } from 'redux-first-router'

const { routesMap } = store.getState().location

const path = actionToPath(action, routesMap)
const action = pathToAction(path, routesMap)
```

You will need the `routesMap` you made, which you can import from where you created it or you can
get any time from your store. 

[Redux First Router Link](https://github.com/faceyspacey/redux-first-router-link)
generates your links using these methods. It does so using the `store` Redux makes available via `context` in 
order for all your links not to need to subscribe to the `store` and become unnecessarilly reactive. 

Unlike *React Router* we do not offer a [NavLink](https://reacttraining.com/react-router/#navlink) component
as that leads to unnecessary renders. We plan to offer it in the future. Until then, it's extremely easy
to make yourself. You can do so in an ad hoc way *without* using `actionToPath` or `pathToAction` (just by using your app-specific state), 
but if you'd like to abstract it, analyze the **Redux First Router Link** code. Feel free to make a PR; we'd welcome
a second export in that package.

