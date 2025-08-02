import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    //  fires when socket active connection and ready to accept connection
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "identity-as-sender" }));
    };
    setSocket(socket);
  }, []);

  const startSendingVideo = async () => {
    if (!socket) return;
    const pc = new RTCPeerConnection();

    // we need to keep on sending the offer when everSDP changes, - like video/audio stream changes etc
    pc.onnegotiationneeded = async () => {
      console.log("fired negotiation");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({ type: "create-offer", sdp: pc.localDescription }) // sdp: offer
      );
    };

    // ice candiates slowily trickle in
    //triggerd when ever new ice candiate is added - this triggering might happen when we start to send some data
    pc.onicecandidate = (event) => {
      // sometime candidate can be null
      console.log("ice", event);
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidates", candidate: event.candidate })
        );
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "answer") {
        pc.setRemoteDescription(data.sdp);
      } else if (data.type === "iceCandidates") {
        console.log("adding-ice");
        pc.addIceCandidate(data.candidates);
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // this will trigger a negotiation needed
    // we can debounce the trigger to send send final SDP to other peer
    // its optial to mention from which stream does the track comes, but it would be helpful to manage video
    pc.addTrack(stream.getVideoTracks()[0], stream);
    pc.addTrack(stream.getAudioTracks()[0], stream);
  };

  return (
    <div>
      <button onClick={startSendingVideo}>Send video</button>
    </div>
  );
};

export default Sender;
