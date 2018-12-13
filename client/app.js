'use strict'

import * as Colyseus from 'colyseus.js'
import Peer from 'simple-peer'

const id = String(Math.random())
const wsUrl = window.location.hostname === 'localhost'
  ? `ws://${window.location.hostname}:8080`
  : `ws://${window.location.host}`
const peer = new Peer({ initiator: true })
const client = new Colyseus.Client(wsUrl)
const room = client.join('relay')

console.log('ID:', id)

room.onMessage.add(data => {
  peer.signal(data)
})

room.onJoin.add(() => {
  peer.on('signal', data => {
    room.send(data)
  })
  peer.on('connect', () => {
    peer.send(id)
  })
  peer.on('data', data => {
    console.log('Received data from', data)
  })
})
