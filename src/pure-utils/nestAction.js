export default function nestAction(pathname, receivedAction, prev) {
  let {type, payload, meta} = receivedAction;
  meta = {
    ...meta,
    location: {
      current: {
        pathname,
        type, 
        payload,
      },
      prev,
    }
  };

  return {
    type, 
    payload,
    meta, 
  };
}