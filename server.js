const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const path = require("path");

let waitingPlayer = null;

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado: " + socket.id);

  socket.on("find_match", () => {
    if (waitingPlayer) {
      const rival = waitingPlayer;
      waitingPlayer = null;
      socket.emit("match_found", { rivalId: rival.id });
      rival.emit("match_found", { rivalId: socket.id });
    } else {
      waitingPlayer = socket;
      socket.emit("waiting");
    }
  });

  socket.on("disconnect", () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
    console.log("Usuario desconectado: " + socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
