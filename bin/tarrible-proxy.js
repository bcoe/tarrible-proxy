#!/usr/bin/env node

var yargs = require('yargs')
    .option('o', {
      alias: 'port',
      default: 8081,
      description: 'port to bind HTTP server on'
    })
    .option('host', {
      default: '127.0.0.1',
      description: 'host to bind HTTP server on'
    })
    .option('p', {
      alias: 'proxy',
      description: 'address to proxy to through corporate proxy'
    })
    .option('h', {
      alias: 'help'
    })
    .demand('proxy'),
  TarribleProxy = require('../')

if (yargs.argv.help) {
  console.log(yargs.help())
} else {
  var proxy = new TarribleProxy(yargs.argv)
  proxy.start()
}
