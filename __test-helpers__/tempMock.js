export default (module, fn, reset = true) => {
  if (reset) jest.resetModules()
  jest.doMock(module, fn)
}
