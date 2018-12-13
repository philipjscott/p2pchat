'use strict'

const port = process.env.PORT || 8080
const colyseus = require('colyseus')
const RelayRoom = require('./room')
const http = require('http')

const server = http.createServer()
const roomServer = new colyseus.Server({ server })

roomServer.register('relay', RelayRoom)

server.listen(port, err => {
  if (err) throw err

  console.log(`Server is listening on port ${port}`)
})
