# node-rtc-signal

Barebones example on how to accomplish P2P audio/video chat in under 200 lines of JS code. Demo page: https://scottyfillups.io/node-rtc-signal/

I recommend trying it out by visiting it on your PC and on your phone :smiley:

### How does it work?

`node-rtc-signal` uses [Colyseus](https://github.com/gamestdio/colyseus) for signalling, and [simple-peer](https://github.com/feross/simple-peer#readme) for establishing P2P connections.

* When a client joins, the signaling server broadcasts a message to every other client (see `room.js`)
* Each client creates a `Peer` object and sends "signal data" (think of a "P2P address") to the server (see `client/app.js`)
* The server relays all the signal data to the client that joined, who creates a `Peer` object for each address
* Finally, the client that joined sends their signal data to all the other clients and establish a P2P connection

In other words, this algorithm constructs a full-mesh topology:

![full-mesh](https://raw.githubusercontent.com/feross/simple-peer/master/img/full-mesh.png)

Unfortunately, full-mesh topologies don't scale well; given `n` peers, there will be `n(n-1)/2` edges. This application begins to lag around ~5 clients. I've capped the maximum number of clients in a room to `4` (see `config/default.json`).

### Running locally

```sh
git clone git@github.com:ScottyFillups/node-rtc-signal.git
yarn install
yarn run dev
```

A browser window should automatically open at http://localhost:1234
