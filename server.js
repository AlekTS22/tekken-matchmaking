const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingPlayer = null;

// Servir archivos estáticos desde 'public'
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

// Usa el puerto asignado por Render o el 3000 por defecto
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
