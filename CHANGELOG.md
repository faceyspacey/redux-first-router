# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0"></a>
# [2.0.0](https://github.com/faceyspacey/redux-first-router/compare/v1.9.19...v2.0.0) (2018-10-05)


### Bug Fixes

* **$compile:** fixes linting errors in `isRedirectAction` ([e74d36e](https://github.com/faceyspacey/redux-first-router/commit/e74d36e))
* **$confirmLeave:** insure confirmLeaves on first page with SSR ([6d8ed89](https://github.com/faceyspacey/redux-first-router/commit/6d8ed89))
* **$deps:** upgrade flow to v0.54.1 ([7b91afe](https://github.com/faceyspacey/redux-first-router/commit/7b91afe))
* **$from/toPath:** do no custom transformation if to/fromPath route options provided ([1a1b1ec](https://github.com/faceyspacey/redux-first-router/commit/1a1b1ec))
* **$middleware:** Fix location access bug of NotFoundAction ([28d0ebc](https://github.com/faceyspacey/redux-first-router/commit/28d0ebc))
* **$NOT_FOUND:** finally fix issue [#175](https://github.com/faceyspacey/redux-first-router/issues/175) --custom place for the location reducer in NOT_FOUND actions ([a870a0a](https://github.com/faceyspacey/redux-first-router/commit/a870a0a))
* **$pathlessRoutes:** bug fixing + more tests ([ef90157](https://github.com/faceyspacey/redux-first-router/commit/ef90157))
* **$readme:** add notes about confirmLeave in [@next](https://github.com/next) on NPM ([4c33c88](https://github.com/faceyspacey/redux-first-router/commit/4c33c88))
* **$readme:** add release update 9/16 ([10c2063](https://github.com/faceyspacey/redux-first-router/commit/10c2063))
* **$readme:** and docs ([527957c](https://github.com/faceyspacey/redux-first-router/commit/527957c))
* **$readme:** optional params [@next](https://github.com/next) release ([a466374](https://github.com/faceyspacey/redux-first-router/commit/a466374))
* **$readme:** release createHistory ([75b0f95](https://github.com/faceyspacey/redux-first-router/commit/75b0f95))
* **$readme:** release notes for updates to [@next](https://github.com/next) branch ([012dbfa](https://github.com/faceyspacey/redux-first-router/commit/012dbfa))
* **$readme:** release update about to/fromPath now transforming even numbers ([4e7de03](https://github.com/faceyspacey/redux-first-router/commit/4e7de03))
* **$thunks:** Skip `onAfterChange` when route thunks dispatch a redirect ([ce82436](https://github.com/faceyspacey/redux-first-router/commit/ce82436)), closes [#96](https://github.com/faceyspacey/redux-first-router/issues/96)
* **fix:** ignore auto-generated OSX .DS_Store files ([bf502ba](https://github.com/faceyspacey/redux-first-router/commit/bf502ba))
* **flow types export:** fixes export of types by adding flow annotation to index file ([89eca12](https://github.com/faceyspacey/redux-first-router/commit/89eca12)), closes [#115](https://github.com/faceyspacey/redux-first-router/issues/115)
* **location reducer:** Call thunk when action kind is push to allow refreshes on same route ([4bc6485](https://github.com/faceyspacey/redux-first-router/commit/4bc6485)), closes [#276](https://github.com/faceyspacey/redux-first-router/issues/276)


### Features

* **$addRoutes:** merge back in addRoutes ([a8d5d6a](https://github.com/faceyspacey/redux-first-router/commit/a8d5d6a))
* **$advancedPathFeatures:** add advanced path features like optional params + fix double dispatch o ([d4f4482](https://github.com/faceyspacey/redux-first-router/commit/d4f4482))
* **$bag:** add 3rd "bag" argument to all callbacks, which includes action + extra keys. ([c11306a](https://github.com/faceyspacey/redux-first-router/commit/c11306a))
* **$basename:** + first rudy pre-release ([1252884](https://github.com/faceyspacey/redux-first-router/commit/1252884))
* **$confirmLeave:** add confirmLeave route option and displayConfirmLeave option ([69c7c80](https://github.com/faceyspacey/redux-first-router/commit/69c7c80))
* **$deps:** upgrade jest ([b14cd8c](https://github.com/faceyspacey/redux-first-router/commit/b14cd8c))
* **$onAfterChange:** Skip `onAfterChange` when route thunks dispatch a redirect ([558ca81](https://github.com/faceyspacey/redux-first-router/commit/558ca81))
* **$routeMap:** Accept meta information in routesMap ([869c78c](https://github.com/faceyspacey/redux-first-router/commit/869c78c))
* **$splitting:** addRoutes ([d3679df](https://github.com/faceyspacey/redux-first-router/commit/d3679df))
* Pre-release fixes ([d72a899](https://github.com/faceyspacey/redux-first-router/commit/d72a899))
* **options.createHistory:** add createHistory option so you can use memoryHistory + your forks/impl ([1ccc5a8](https://github.com/faceyspacey/redux-first-router/commit/1ccc5a8))
* **pathlessRoutes:** you can now have routes with paths for the of a formalized thunk contract + ca ([06f3f84](https://github.com/faceyspacey/redux-first-router/commit/06f3f84))


### Performance Improvements

* object entires over object keys ([067b3fb](https://github.com/faceyspacey/redux-first-router/commit/067b3fb))


### BREAKING CHANGES

* **$from/toPath:** path segments that are numbers will now be passed to to/fromPath
