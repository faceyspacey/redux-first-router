// @flow
import { typeToScene } from '../../utils'

export default (types, actions, routes, options) => {
  const opts = { ...options }
  opts.scene = typeToScene(Object.keys(routes)[0])
  delete opts.logExports

  const optsString = JSON.stringify(opts)
    .replace(/"scene":/, 'scene: ')
    .replace(/"basename":/, 'basename: ')
    .replace(/"/g, "'")
    .replace('{', '{ ')
    .replace('}', ' }')
    .replace(/,/g, ', ')

  let t = ''
  for (const type in types) t += `\n\t${type},`

  let a = ''
  for (const action in actions) a += `\n\t${action},`

  // destructure createActions()
  let exports = `const { types, actions } = createScene(routes, ${optsString})`
  exports += `\n\nconst { ${t.slice(0, -1)}\n} = types`
  exports += `\n\nconst { ${a.slice(0, -1)}\n} = actions`

  // types exports
  exports += `\n\nexport {${t}`
  exports = `${exports.slice(0, -1)}\n}`

  // actions exports
  exports += `\n\nexport {${a}`
  exports = `${exports.slice(0, -1)}\n}`

  if (process.env.NODE_ENV !== 'test') console.log(exports)
  return exports
}
