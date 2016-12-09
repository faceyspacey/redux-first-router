export default function formatParams(route, params) {
  let routePath;

  if(typeof route === 'object') { //eg: {route: '/page/:param'}
    routePath = route.path;

    if(route.capitalizedWords === true) {
      params = Object.keys(params).reduce((sluggifedParams, key) => {
        if(typeof params[key] === 'string') {
        sluggifedParams[key] = params[key].replace(/ /g, '-').toLowerCase();
        }
        else if(typeof params[key] === 'number') {
          sluggifedParams[key] = params[key];
        }
    
        return sluggifedParams;
      }, {});
    }
    else if(typeof route.toPath === 'function') {
      params = Object.keys(params).reduce((sluggifedParams, key) => {
        sluggifedParams[key] = route.toPath(params[key]);
      }, {});
    }
  }
  else {
    routePath = route;
  }

  return {routePath, params}; //eg: '/page/:param'
}