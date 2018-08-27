const config = require('../.testsConfig.json')

// this allows for:
//
// - toggling logging for all tests
// - toggling whether `snap`, `snapPop` and `snapChange` just dispatch or dispatch + snap
//   (useful, for verifying "snipes" work without being cluttered by snapshot diffs)
// - etc
process.env.RUDY_OPTIONS = JSON.stringify(config)
