'use strict'

import * as Colyseus from 'colyseus.js'
import Peer from 'simple-peer'
import config from '../config/default.json'

if (window.location.hostname === 'localhost') {
  run(`ws://${window.location.hostname}:8080`)
} else {
  // Fetch an opaque response to wake up the dyno
  window.fetch(`https://${config.app.host}`, { mode: 'no-cors' })
    .then(() => run(`wss://${config.app.host}`))
    .catch(() => console.error('Signalling server failed to send response'))
}

function run (wsUrl) {
  const client = new Colyseus.Client(wsUrl)
  const room = client.join('relay')
  const peers = {}
  const mediaPromise = getMedia({
    video: true,
    audio: true
  })
    .catch(() => getMedia({ audio: true }))
    .catch(() => getMedia({ video: true }))

  getMedia({ video: true }).then(appendVideo.bind(null, 'self-video'))

  room.onMessage.add(message => {
    if (message.target === room.sessionId) {
      return
    }

    switch (message.action) {
      case 'create':
        peers[message.target] = createPeer(room, message, mediaPromise, true)
        break
      case 'signal':
        if (!peers[message.target]) {
          peers[message.target] = createPeer(room, message, mediaPromise, false)
        }
        peers[message.target].then(peer => {
          peer.signal(message.data)
        })
        break
      case 'destroy':
        peers[message.target].then(peer => {
          destroyPeer(message, peer)
        })
        break
      default:
        throw new Error('Invalid action')
    }
  })
}

function getMedia (constraints) {
  return navigator.mediaDevices.getUserMedia(constraints)
}

function destroyPeer (message, peer) {
  const video = document.querySelector(`#${message.target}`)

  video.parentNode.removeChild(video)
  peer.destroy()
}

function createPeer (room, message, mediaPromise, initiator) {
  return mediaPromise.then(stream => {
    const peer = new Peer({ initiator, stream })

    peer.on('signal', data => {
      room.send({ target: message.target, data })
    })
    peer.on('stream', appendVideo.bind(null, message.target))

    return peer
  })
}

function appendVideo (id, stream) {
  const video = document.createElement('video')

  document.body.appendChild(video)
  video.id = id
  try {
    video.srcObject = stream
  } catch (error) {
    console.error(error)
    video.src = URL.createObjectURL(stream)
  }
  video.play()

  return stream
}
