# Troubleshooting

### location reducer and window.location

If you called your routing handler reducer `location`, it is possible to confound with the global javascript variable of the browser `window.location`.
Indeed, `window.location` or `location` is a callable global variable in the browser.
When writing function that includes destructuring with the location reducer, it is possible to write:

```javascript
const f = ({location: type}) => console.log(location);
```

This code will not raise an error, because it will log the `window.location` variable.
So be careful when using destructuring with `location`. It can lead to manipulate unwanted object.
