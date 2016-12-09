export default function nestAction(pathname, receivedAction, prev) {
  let {type, payload, meta} = receivedAction;
  
  return {
    type, 
    payload,
    meta, 
    location: {
      current: {
        pathname,
        type, 
        payload,
      },
      prev,
    }
  };
}