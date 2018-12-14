'use strict'

const config = require('config')
const colyseus = require('colyseus')
const RelayRoom = require('./room')
const http = require('http')

const port = process.env.PORT || config.app.port
const server = http.createServer()
const roomServer = new colyseus.Server({ server })

roomServer.register('relay', RelayRoom)

server.listen(port, err => {
  if (err) throw err

  console.log(`Server is listening on port ${port}`)
})
