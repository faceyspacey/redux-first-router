// the history package generates keys for history entries using Math.random
// this makes it deterministic (note: it can be anything since we dont use it)
global.Math.random = () => '123456789'
