import MyComponent from './MyComponent'
import async from '../../reducers/async'
import thunk from './thunk'

const components = { MyComponent }
const reducers = { async }
const chunk = 'MyComponent'

export { components, reducers, thunk, chunk }
export default MyComponent
