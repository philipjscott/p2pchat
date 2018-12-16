'use strict'

const { Room } = require('colyseus')
const config = require('config')

class RelayRoom extends Room {
  onInit () {
    this.maxClients = config.app.maxClients
    this.users = {}
  }

  onJoin (client) {
    console.log(client.sessionId, '-> *')

    this.broadcast({
      action: 'create',
      target: client.sessionId
    })

    this.users[client.sessionId] = client
  }

  onLeave (client) {
    console.log(client.sessionId, '<!>')

    this.broadcast({
      action: 'destroy',
      target: client.sessionId
    })

    delete this.users[client.sessionId]
  }

  onMessage (client, data) {
    console.log(client.sessionId, '->', data.target)

    this.send(this.users[data.target], {
      action: 'signal',
      data: data.data,
      target: client.sessionId
    })
  }
}

module.exports = RelayRoom
