<a href="https://codesandbox.io/s/github/faceyspacey/redux-first-router-codesandbox" target="_blank">
  <img alt="Edit Redux-First Router Demo" src="https://codesandbox.io/static/img/play-codesandbox.svg">
</a>


# Universal Demonstration of [Redux-First Router](https://github.com/faceyspacey/redux-first-router)

This demo specializes in SSR and the sort of things like redirecting and authentication you will do on the server. For the simpler example that's easier to start with, check out the [Redux-First Router Boilerplate](https://github.com/faceyspacey/redux-first-router-boilerplate).



![redux-first-router-demo screenshot](./screenshot.png)

## Installation

```
git clone https://github.com/faceyspacey/redux-first-router-demo
cd redux-first-router-demo
yarn
yarn start
```


## Files You Should Look At:

*universal code:*
- [***src/routesMap.js***](./src/routesMap.js) - *(observe thunks and `onBeforeChange`)*
- [***src/utils.js***](./src/utils.js) - *(check `isAllowed` function)*

*client code:*
- [***src/configureStore.js***](./src/configureStore.js) - *(nothing new here)*
- [***src/components/Switcher.js***](./src/components/Switcher.js) - *(universal component concept)*
- [***src/components/UniversalComponent.js***](./src/components/UniversalComponent.js) - ***(universal component concept continued...)***
- [***src/components/Sidebar.js***](./src/components/Sidebar.js) - *(look at the different ways to link + dispatch URL-aware actions)*
- [***src/reducers/index.js***](./src/reducers/index.js) -  *(observe simplicity of the `page` reducer. Also be cognizant of non-route action types)*


*server code:*
- [***server/index.js***](./server/index.js) - *(built-in ajax API + fake cookie handling)*
- [***server/render.js***](./server/render.js) - *(super simple thanks to [webpack-flush-chunks](https://github.com/faceyspacey/webpack-flush-chunks))*
- [***server/configureStore.js***](./server/configureStore.js) - ***(this is the gem of the repo -- observe how to filter authentication)***

## Notes
I comment throughout the code various things you can try. Look out for comments starting with *"TRY:"* and *"TASK:"*. 

For example, there are simple values like the `jwToken` you can toggle to get access to the restricted *admin* area. That showcases a key feature: ***authentication filtering.*** 

In general, this Demo is all about SSR. It shows how to use the `onBeforeChange` to properly authenticate user's and routes using *JSON Web Tokens*. And of course data-fetching via `thunks` is central to it all. **There's even a real API.**

Lastly, the [***server/configureStore.js***](./server/configureStore.js) file is the absolute most important file of the demo. It essentially brings your ***routing-aware Redux store*** full circle by bringing it server-side in a dead simple yet flexible manner. It works in combination with [***src/routesMap.js***](./src/routesMap.js). Study those and your redux routing dreams have come true 😀

> As a bonus, it comes with code-splitting thanks to [react-universal-component](https://github.com/faceyspacey/react-universal-component). This setup makes splitting stupid-easy. In the future, ***routing-aware pre-fetching*** will be added to the mix, so the users never know you're only serving partial parts of your app 🚀


## TO DO

- auth0-based signup/login that replaces current fake cookie/JWToken setup *(PR welcome)*
