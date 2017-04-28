// @flow

export default (): boolean => typeof window === 'undefined' || !!window.SSRtest
