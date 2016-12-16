export default function(action) {
  return action.meta && action.meta.location;
}