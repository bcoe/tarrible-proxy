var _ = require('lodash'),
  http = require('http'),
  request = require('request'),
  url = require('url')

function TarribleProxy (opts) {
  _.extend(this, {
    port: 8081, // what port should we run the proxy on.
    proxy: null, // URL to proxy to.
    host: '127.0.0.1'
  }, opts)
}

TarribleProxy.prototype.start = function () {
  var _this = this

  var server = http.createServer(function (req, res) {
    var opts = {
      url: _this.proxy + req.url,
      method: req.method,
      headers: _.extend({}, req.headers),
      strictSSL: false
    }

    opts.headers.host = 'registry.npmjs.org'

    if (/^\/[^/]+$/.test(req.url)) {
      console.log('rewrite', req.url)
      opts.json = true
      request(opts, function (err, resp, obj) {
        if (obj.versions) _this.rewriteVersions(obj)

        res.setHeader('Content-Type', 'application/json')
        res.writeHead(resp.statusCode)
        res.write(JSON.stringify(obj))
        res.end()
      })
    } else {
      console.log('proxy', req.url)
      request(opts).pipe(res)
    }
  })

  console.log('listen on ', this.host + ':' + this.port, ' proxy to = ', this.proxy)
  server.listen(this.port, this.host)
}

TarribleProxy.prototype.rewriteVersions = function (obj) {
  var _this = this

  Object.keys(obj.versions).forEach(function (version) {
    if (obj.versions[version].dist) {
      var u = url.parse(obj.versions[version].dist.tarball)
      obj.versions[version].dist.tarball = url.resolve(
        'http://' + _this.host + ':' + _this.port,
        u.path
      )
    }
  })
}

module.exports = TarribleProxy
