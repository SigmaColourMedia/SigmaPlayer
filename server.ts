import { app } from "./app.ts";
import { socket } from "./socket.ts";

const server = app.listen(process.env.HTTP_PORT, () =>
  console.log("HTTP Listening on port ", process.env.HTTP_PORT),
);
socket.bind(Number(process.env.UDP_EVENT_PORT));
socket.on("listening", () =>
  console.log("UDP listening on port ", process.env.UDP_EVENT_PORT),
);

export default server;
