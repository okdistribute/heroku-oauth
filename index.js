var request = require('request')
var events = require('events')
var url = require('url')
var path = require('path')
var crypto = require('crypto')

module.exports = function(opts) {
  if (!opts.callbackURI) opts.callbackURI = '/heroku/callback'
  if (!opts.loginURI) opts.loginURI = '/heroku/login'
  if (!opts.scope) opts.scope = 'global'
  var state = crypto.randomBytes(8).toString('hex')
  var urlObj = url.parse(opts.baseURL)
  urlObj.pathname = path.join(urlObj.pathname, opts.callbackURI)
  var redirectURI = url.format(urlObj)
  var emitter = new events.EventEmitter()

  function login(req, resp) {
    var u = 'https://id.heroku.com/oauth/authorize'
        + '?client_id=' + opts.herokuClient
        + '&response_type=code'
        + '&scope=' + opts.scope
        + '&redirect_uri=' + redirectURI
        + '&state=' + state
        ;
    resp.statusCode = 302
    resp.setHeader('location', u)
    resp.end()
  }

  function callback(req, resp, cb) {
    var query = url.parse(req.url, true).query
    var code = query.code
    if (!code) return emitter.emit('error', {error: 'missing oauth code'}, resp)
    if (query.state !== state) return emitter.emit('error', {error: 'impromper state csrf token'}, resp)

    var u = 'https://id.heroku.com/oauth/token'
    var data = {
      grant_type: authorization_code,
      code: code
    }
    request.post({url:u, json: true}, function (err, tokenResp, body) {
      if (err) {
        if (cb) {
          err.body = body
          err.tokenResp = tokenResp
          return cb(err)
        }
        return emitter.emit('error', body, err, resp, tokenResp, req)
      }
      if (cb) {
        cb(null, body)
      }
      emitter.emit('token', body, resp, tokenResp, req)
    })
  }

  emitter.login = login
  emitter.callback = callback
  emitter.addRoutes = addRoutes
  return emitter
}
