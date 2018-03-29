const config = require('../.testsConfig.json')

// this allows for:
//
// - toggling logging for all tests
// - toggling whether `snap`, `snapPop` and `snapChange` just dispatch or dispatch + snap
//   (useful, for verifying "snipes" work without being cluttered by snapshot diffs)
// - etc
process.env.RUDY_OPTIONS = JSON.stringify(config)

// the history package generates keys for history entries using Math.random
// this makes it deterministic (note: it can be anything since we dont use it)
global.MathRandom = Math.random
global.Math.random = () => '123456789'

