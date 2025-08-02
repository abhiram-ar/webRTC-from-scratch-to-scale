import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let reciverSocket: null | WebSocket = null;

wss.on("listening", () => {
  console.log("ws server listening on port 8080");
});

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data: any) => {
    const message = JSON.parse(data);
   //  console.log(message);

    if (message.type === "identity-as-sender") {
      senderSocket = ws;
      console.log("sender set");
    } else if (message.type === "identify-as-reciver") {
      reciverSocket = ws;
      console.log("recicver set");
    } else if (message.type === "create-offer") {
      reciverSocket?.send(JSON.stringify({ type: "offer", sdp: message.sdp }));
      console.log("offer recived", message.sdp);
    } else if (message.type === "create-answer") {
      senderSocket?.send(JSON.stringify({ type: "answer", sdp: message.sdp }));
      console.log("answer recived", message.sdp);
    } else if (message.type === "iceCandidates") {
      if (ws === reciverSocket) {
        senderSocket?.send(
          JSON.stringify({
            type: "iceCandidates",
            candidate: message.candidate, 
          })
        );
      } else if (ws === senderSocket) {
        reciverSocket?.send(
          JSON.stringify({
            type: "iceCandidates",
            candidate: message.candidate,
          })
        );
      }
    }
  });
});
