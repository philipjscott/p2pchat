'use strict'

import * as Colyseus from 'colyseus.js'
import Peer from 'simple-peer'

const wsUrl = window.location.hostname === 'localhost'
  ? `ws://${window.location.hostname}:8080`
  : `ws://${window.location.host}`

const client = new Colyseus.Client(wsUrl)
const room = client.join('relay')
const peers = {}
const mediaPromise = navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).catch(console.error)

room.onMessage.add(message => {
  if (message.target === room.sessionId) {
    return
  }

  switch (message.action) {
    case 'create':
      peers[message.target] = createPeer(message, mediaPromise, true)
      break
    case 'signal':
      if (!peers[message.target]) {
        peers[message.target] = createPeer(message, mediaPromise, false)
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

function destroyPeer (message, peer) {
  const video = document.querySelector(`#${message.target}`)

  video.parentNode.removeChild(video)
  peer.destroy()
}

function createPeer (message, mediaPromise, initiator) {
  return mediaPromise.then(stream => {
    const peer = new Peer({ initiator, stream })

    peer.on('signal', data => {
      room.send({ target: message.target, data })
    })
    peer.on('stream', targetStream => {
      const video = document.createElement('video')

      document.body.appendChild(video)
      video.id = message.target
      try {
        video.srcObject = targetStream
      } catch (error) {
        console.error(error)
        video.src = URL.createObjectURL(targetStream)
      }
      video.play()
    })

    return peer
  })
}
