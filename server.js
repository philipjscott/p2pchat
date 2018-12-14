'use strict'

const config = require('config')
const colyseus = require('colyseus')
const RelayRoom = require('./room')
const http = require('http')

// Add an HTTP ping handler to avoid Heroku timeout
const onPing = (_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write('hello, world')
  res.end()
}
const onListen = port => err => {
  if (err) throw err

  console.log(`Server is listening on port ${port}`)
}

const port = process.env.PORT || config.app.port
const server = http.createServer(onPing)
const roomServer = new colyseus.Server({ server })

roomServer.register('relay', RelayRoom)
server.listen(port, onListen(port))
