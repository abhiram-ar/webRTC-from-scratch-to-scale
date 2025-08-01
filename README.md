# webRTC

why?
- webRTC is the core/only protocol that lets you do real-time media communication from inside a browser
- sub-second latency
- 30FPS games

> NOTE: cricket matches, Youtube live streaming does not use webRTC.
> They use `HLS` - why because there 2-5 second delay is not a problem

### webRTC Architecture - P2P

webRTC is a peer to peer protocol. That means that you can directly send your media over to other person without the need of a central server (but there is a catch)

<img src="./assets/p2p-vs-client-server.png" alt="p2p vs client-server architecture" style="width:100%;" />

- relaying video through a server is very expensive
- for webRTC we do need a central server for signaling and sometimes for sending media as well (TURN server)

> **IP Leaks:**  
> When peers connect directly, each peer's IP address is exposed to the other. This can result in user IP leakage.

### Signaling server

Both the browser need to exchange their address before they can start taking to each other. A signaling server is used for this purpose

<img src="./assets/signaling server architecture.png" alt="singling server architecture" style="width" />

- Initially info exchange is usually done through websocket connection, but can be anything(http)
- One the IPs have been exchanged, we don't need the central server anymore. Communication can happen P2P

### Stun (Session Traversal Utilities for NAT)

##### NAT - Network Address Translation

- There are limited IPs in the world (that's why we have common public IPs for hotels, hostels, college etc.)
- Because of this webRTC discovery becomes difficult
  i.e. when peer-1 tries to connect to another peer-2, peer-1 sees the public IP peer-2 not the actual IP address of peer-2

STUN solves the problem of webRTC discovery
google has a free STUN server : [link](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) - useful for debugging webRTC peers
<img src="./assets/STUN servers.png" alt="STUN server architecture" style="width:" />

### ICE (Interactive Connectivity Establishment) candidates

- Bunch of `IP:Port` from which traffic can reach you over a network
- IF two people try to connect to each other in a `hotel-Wifi`, they can connect via their private router ICE candidate
- If two people from different countries are trying to connect to each other, they would connect using their public IPs

### TURN server

- Depending upon the [[Types of NAT]] the strictness can vary,
  i.e. can traffic to come from other places rather than from those client who opened a connection in NAT
- When we get an IP from the STUN server, The browser sometimes expect the data to come from the STUN server and blocks the data coming from other browser

<img src="./assets/TURN server.png" alt="TURN server architecture" style="width" />

- TURN server gives us extra ICE candidates
- TURN is an optional fallback if we cannot directly connect (P2P), in such case the data will be routed trough the TURN server

### Offer

The process of first browser (the one initiating connection) sending their ICE candidates to the other side

### Answer

The other side returning their ICE candidates is called the answer

### SDP (Session description protocol)

A single file that contains all your,

1. ICE candidates
2. what media you want to send, what protocol you have used to encode the media etc.

This is the file that is send in the `Offer` and `Answer`
<img src="./assets/SDP flow.png" alt="SDP flow"  />

## RTCPeerConnection object in browser

This object helps in establishing a webRTC connection and hides the protocol level implementation

```js
const pc = new RTCPeerConnection();
```

debugging - visit `chrome://webrtc-internals/` to see the active `RTCPeerConnection` objects and their stats

once we create a peer connection we need to create an `offer`, which is required for initiating a connection

```js
const offer = await pc.createOffer();

pc.setLocalDescription(offer);
//note: this we need to manually set the `offer` `SDP`
```

- from here browser-1 sends the `offer` `SDP` to brower-2 through `signaling server`
- browser-2 sets the its `remote description` as `offer`
- browser-2 creates an `answer` `SDP`

```js
const answer = pc2.createAnswer();
pc2.setRemoteDescription(answer);
```

- browser-2 sets the `answer` as the `local description`
- browser-2 sends the `answer` `SDP` to browser-1 via `singaling server`
- browser-1 sets its `remote description` as `answer`

![webRTC connection flow](./assets/webRTC%20connection.png)

This is just to establish a connection

To do video call

- we need to have mic/camera permission
- get audio and video `stream`
- call `addTrack` on `pc`
- this would trigger an `onTrack` callback on the other side
