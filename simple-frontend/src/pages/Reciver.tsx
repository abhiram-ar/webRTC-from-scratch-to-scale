import { useEffect, useRef } from "react";

const Reciver = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    //  fires when socket active connection and ready to accept connection
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "identify-as-reciver" }));
    };

    const mediaStream = new MediaStream();
    if (videoRef.current && mediaStream.getTracks().length > 0) {
      videoRef.current.srcObject = mediaStream;
    }

    let pc: RTCPeerConnection;
    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "offer") {
        pc = new RTCPeerConnection();

        pc.ontrack = (event) => {
          console.log("track received:", event.track);
          if (videoRef.current) {
            mediaStream.addTrack(event.track);
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
          }
        };

        await pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(
          JSON.stringify({ type: "create-answer", sdp: pc.localDescription })
        );

        pc.onicecandidate = (event) => {
          // sometime candidate can be null
          console.log("ice", event);
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidates",
                candidate: event.candidate,
              })
            );
          }
        };
      } else if (message.type === "iceCandidates") {
        console.log("adding-ice");
        pc.addIceCandidate(message.candidate);
      }
    };
  }, []);
  return (
    <div>
      Reciver
      <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
};

export default Reciver;
