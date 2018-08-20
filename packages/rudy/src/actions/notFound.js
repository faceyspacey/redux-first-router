// @flow

export default (state: ?Object, type: ?string) =>
  ({
    type: type || 'NOT_FOUND', // type not meant for user to supply; it's passed by generated action creators
    state,
  }: { state: ?Object, type: string })
