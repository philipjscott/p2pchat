'use strict'

const { Room } = require('colyseus')
const wrtc = require('wrtc')
const Peer = require('simple-peer')

class RelayRoom extends Room {
  onInit () {
    this.peers = {}
  }

  onJoin (client, options) {
    const peer = new Peer({ wrtc })

    this.peers[client.sessionId] = peer

    peer.on('signal', signal => {
      this.send(client, signal)
    })
    peer.on('connect', () => {
      console.log(`Peer client ${client.sessionId} connected!`)
    })
    peer.on('data', data => {
      for (const peerId in this.peers) {
        if (peerId !== client.sessionId) {
          this.peers[peerId].send(data)
        }
      }
    })
  }

  onLeave (client) {
    this.peers[client.sessionId].destroy()

    delete this.peers[client.sessionId]
  }

  onMessage (client, data) {
    this.peers[client.sessionId].signal(data)
  }
}

module.exports = RelayRoom
