# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.1](https://github.com/faceyspacey/redux-first-router/compare/v2.1.0...v2.1.1) (2018-11-06)

* Fix(scrolling): fixes exported updateScroll function if set to manual

* docs(connectRoutes): Improve doc

Move doc about the bag option from docs/migration to docs/connectRoutes.
Improve options order based on priority and runtime order.

* docs(low-level-api): Improve doc

Add missing doc about strict option.
Fix wrong doc about NavLink component.

* docs(react-native): Fix removed history argument

Remove history arg as argument as it's handled internally since RFR v2.

* docs(low-level-api): Fix grammar

* docs(low-level-api): Improve strict option description

* docs(connectRoutes): Fix description of location and title options
 


<a name="2.0.5"></a>
## [2.0.5](https://github.com/faceyspacey/redux-first-router/compare/v2.0.4...v2.0.5) (2018-10-12)

* docs(badges): Fixed min node version badge

* fix(babelrc): Fixing babel configs

Configuring env middleware correctly. Making sure build passes and tests pass.

<a name="2.0.4"></a>
## [2.0.4](https://github.com/faceyspacey/redux-first-router/compare/v2.0.2...v2.0.4) (2018-10-12)



<a name="2.0.3"></a>
## [2.0.3](https://github.com/faceyspacey/redux-first-router/compare/v2.0.2...v2.0.3) (2018-10-12)


* **docs(readme):** Migration documentation

Small content block describing how to move from v1 to v2

* **docs:** Adding node badge to readme

badge and engine set to indeicate min version of Node 8 required

* **docs(migration)**: Moved migration notes to docs/migration.md

To prevent the Readme getting longer, ive moved migration docs to their own markdown file. Added
additional notes about the `bag` option which is another breaking change


<a name="2.0.2"></a>
## [2.0.2](https://github.com/faceyspacey/redux-first-router/compare/v2.0.0...v2.0.2) (2018-10-12)


### Bug Fixes

* **middlewareCreateAction:** Error logging ([#303](https://github.com/faceyspacey/redux-first-router/issues/303)) ([6e214fc](https://github.com/faceyspacey/redux-first-router/commit/6e214fc))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/faceyspacey/redux-first-router/compare/rudy...v2.0.1) (2018-10-05)

### Bug fixes

- **$middleware:** Fix location access bug of NotFoundAction ([28d0ebc](https://github.com/faceyspacey/redux-first-router/commit/28d0ebc))
- **$readme:** add release update 9/16 ([10c2063](https://github.com/faceyspacey/redux-first-router/commit/10c2063))
- **$readme:** release createHistory ([75b0f95](https://github.com/faceyspacey/redux-first-router/commit/75b0f95))
- **$readme:** release update about to/fromPath now transforming even numbers ([4e7de03](https://github.com/faceyspacey/redux-first-router/commit/4e7de03))
- **flow types export:** fixes export of types by adding flow annotation to index file ([89eca12](https://github.com/faceyspacey/redux-first-router/commit/89eca12)), closes [#115](https://github.com/faceyspacey/redux-first-router/issues/115)
- **location reducer:** Call thunk when action kind is push to allow refreshes on same route ([4bc6485](https://github.com/faceyspacey/redux-first-router/commit/4bc6485)), closes [#276](https://github.com/faceyspacey/redux-first-router/issues/276)
- Ensure that the `querySerializer` option is used for the initial action ([508af4f](https://github.com/faceyspacey/redux-first-router/commit/508af4ff149090d0613d5a3a88809ece66a0e1fe)) (Closes [#265](https://github.com/faceyspacey/redux-first-router/issues/265))
- Ensure `thunk` is called when refreshing the initial route ([#288](https://github.com/faceyspacey/redux-first-router/pull/288)) (fixes [#276](https://github.com/faceyspacey/redux-first-router/issues/276))
- Fix crash in `canGoBack` and `canGoForward` ([#291](https://github.com/faceyspacey/redux-first-router/pull/291)) (fixes [#285](https://github.com/faceyspacey/redux-first-router/issues/285))

### Features

- Add `coerceNumbers` flag to allow disabling integer coersion before `fromPath` ([#
294](https://github.com/faceyspacey/redux-first-router/pull/294)) (fixes [#292](https://github.com/faceyspacey/redux-first-router/issues/292))
- Pre-release fixes ([d72a899](https://github.com/faceyspacey/redux-first-router/commit/d72a899))

### Performance Improvements

* object entires over object keys ([067b3fb](https://github.com/faceyspacey/redux-first-router/commit/067b3fb))

<a name="0.0.9-rudy"></a>
## [0.0.9-rudy](https://github.com/faceyspacey/redux-first-router/compare/next...9c3822a) (2018-03-19)

### Bug fixes

- **fix:** ignore auto-generated OSX .DS_Store files ([bf502ba](https://github.com/faceyspacey/redux-first-router/commit/bf502ba))
- **$readme:** add notes about confirmLeave in [@next](https://github.com/next) on NPM ([4c33c88](https://github.com/faceyspacey/redux-first-router/commit/4c33c88))
- **$readme:** optional params [@next](https://github.com/next) release ([a466374](https://github.com/faceyspacey/redux-first-router/commit/a466374))
- **$deps:** upgrade flow to v0.54.1 ([7b91afe](https://github.com/faceyspacey/redux-first-router/commit/7b91afe))
- **$thunks:** Skip `onAfterChange` when route thunks dispatch a redirect ([2dff758](https://github.com/faceyspacey/redux-first-router/commit/2dff758)), closes [#96](https://github.com/faceyspacey/redux-first-router/issues/96)
- **$compile:** fixes linting errors in `isRedirectAction` ([e74d36e](https://github.com/faceyspacey/redux-first-router/commit/e74d36e))
- **$readme:** release notes for updates to [@next](https://github.com/next) branch ([012dbfa](https://github.com/faceyspacey/redux-first-router/commit/012dbfa))
- **$basename:** + first rudy pre-release ([1252884](https://github.com/faceyspacey/redux-first-router/commit/1252884))
- **$from/toPath:** do no custom transformation if to/fromPath route options provided ([1a1b1ec](https://github.com/faceyspacey/redux-first-router/commit/1a1b1ec))
- **$NOT_FOUND:** finally fix issue [#175](https://github.com/faceyspacey/redux-first-router/issues/175) --custom place for the location reducer in NOT_FOUND actions ([a870a0a](https://github.com/faceyspacey/redux-first-router/commit/a870a0a))
- check typeof window in `getDocument()` ([869f2fc](https://github.com/faceyspacey/redux-first-router/commit/869f2fcccc76bbf45edf341ce75ba2329a2dd22d))
- make sure hex params are not treated as numbers ([d27ff9e](https://github.com/faceyspacey/redux-first-router/commit/d27ff9ef42f323ea3854d95485c5a64bd4b08a58))
- honor returns from dispatch in redirectAwareDispatch ([9c3822a](https://github.com/faceyspacey/redux-first-router/commit/9c3822a2c224752b1aae3e66c6525f6d56aec25f))

### Features

- **options.createHistory:** add createHistory option so you can use memoryHistory + your forks/impl ([1ccc5a8](https://github.com/faceyspacey/redux-first-router/commit/1ccc5a8))
- **$deps:** upgrade jest ([b14cd8c](https://github.com/faceyspacey/redux-first-router/commit/b14cd8c))
- **$routeMap:** Accept meta information in routesMap ([869c78c](https://github.com/faceyspacey/redux-first-router/commit/869c78c))

### BREAKING CHANGES

- `connectRoutes` no longer accepts the `history` object as an argument, instead it is created internally ([0c2ec39](https://github.com/faceyspacey/redux-first-router/commit/0c2ec39))

<a name="0.0.20-next"></a>
## [0.0.20-next](https://github.com/faceyspacey/redux-first-router/compare/v1.9.19...next) (2017-09-11)

### Bug fixes

- **$confirmLeave:** insure confirmLeaves on first page with SSR ([6d8ed89](https://github.com/faceyspacey/redux-first-router/commit/6d8ed89))

### Features

- **$splitting:** addRoutes ([d3679df](https://github.com/faceyspacey/redux-first-router/commit/d3679df))\
- **$confirmLeave:** add confirmLeave route option and displayConfirmLeave option ([69c7c80](https://github.com/faceyspacey/redux-first-router/commit/69c7c80))
- **$advancedPathFeatures:** add advanced path features like optional params + fix double dispatch o ([d4f4482](https://github.com/faceyspacey/redux-first-router/commit/d4f4482))
- **pathlessRoutes:** you can now have routes with paths for the of a formalized thunk contract + ca ([06f3f84](https://github.com/faceyspacey/redux-first-router/commit/06f3f84))
- **$addRoutes:** merge back in addRoutes ([a8d5d6a](https://github.com/faceyspacey/redux-first-router/commit/a8d5d6a))

### BREAKING CHANGES

- **$bag:** add 3rd "bag" argument to all callbacks, which includes action + extra keys, replacing the previous `action` argument to `onBeforeChange` and `onAfterChange` ([c11306a](https://github.com/faceyspacey/redux-first-router/commit/c11306a))

<a name="1.9.19"></a>
## 1.9.19 (2017-08-24)

Changes prior to this version were not recorded. See the commit log.
