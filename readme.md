#heroku-oauth

simple functions for doing oauth login with heroku. compatible with any node http server that uses handler callbacks that look like `function(req, res) {}`.

[![NPM](https://nodei.co/npm/heroku-oauth.png)](https://nodei.co/npm/heroku-oauth/)

see also: [github-oauth](http://github.com/maxogden/heroku-oauth)


```javascript
var herokuOauth = require('heorku-oauth')({
  herokuClient: process.env['HEROKU_CLIENT'],
  baseURL: 'http://localhost',
  loginURI: '/heroku/login', // optional default
  callbackURI: '/heroku/callback', // optional default
  scope: 'global' // optional default
})

require('http').createServer(function(req, res) {
  if (req.url.match(/heroku/login/)) return herokuOAuth.login(req, res)
  if (req.url.match(/heroku/callback/)) return herokuOAuth.callback(req, res)
}).listen(80)

herokuOAuth.on('error', function(err) {
  console.error('there was a login error', err)
})

herokuOAuth.on('token', function(token, serverResponse) {
  console.log('here is your shiny new heroku oauth token', token)
  serverResponse.end(JSON.stringify(token))
})
```