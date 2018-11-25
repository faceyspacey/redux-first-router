### Embedding SEO-friendly links

Use our small [`<Link>` package](https://github.com/faceyspacey/redux-first-router-link) to ensure that an actual anchor is embedded for SEO benefits:

`yarn install redux-first-router-link`

If SEO is not required, navigation can of course be done entirely through actions as in the `<button>` example below.

```js
// App.js
import Link from 'redux-first-router-link'
 
const App = ({ page, changeUser }) => {
  const Component = components[page]
  return (
    <div>
      <Link to="/user/123">User 123</Link>
      <Link to={{ type: 'USER', payload: { id: 456 } }}>User 456</Link>
      <button onClick={() => changeUser(789)}>User 789</button>
      <Component />
    </div>
  )
}
 
const mapStateToProps = ({ page }) => ({ page })
 
const mapDispatchToProps = dispatch => ({
  changeUser: id => dispatch({ type: 'USER', payload: { id } })
})
export default connect(mapStateToProps, mapDispatchToProps)(App)
```

The **recommended approach** is to use the `<Link to={action}>` method because it keeps the URL scheme separate from the components. URLs can then be changed by just editing `routesMap.js`.

### Styling active links

[`redux-first-router-link`](https://github.com/faceyspacey/redux-first-router-link) also provides the stylable `{ NavLink }`:

```js
  <NavLink to={{homeAction}} activeStyle={{ color: 'red' }}>Home</NavLink>
```
```js
  <NavLink to={{homeAction}} activeClassName="my-active-link-css-class">Home</NavLink>
```
Examples using a CSS-in-JS approach such as [`emotion`](https://emotion.sh/):
```js
import styled from 'react-emotion'

const StyledNavLink = styled(NavLink)`
  &.my-active-link-class {
    color: peru
  }
`;

{/* Default activeClassName "active" overridden only for demonstration purposes */} 
<StyledNavLink to={{homeAction}} activeClassName="my-active-link-class">Home</StyledNavLink>
```
or
```js
import { css } from 'react-emotion'

const activeLinkStyle = css`
  color: dodgerblue;
`;

<NavLink to={{homeAction}} activeClassName={activeLinkStyle}>Home</NavLink>
```

Documentation and more examples can be found in the [GitHub repo](https://github.com/faceyspacey/redux-first-router-link).
