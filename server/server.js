const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
const app = express();
const idNameMap = {};
const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:8081"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
console.log(cors);
app.use(cors(corsOptions));

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:8081"],
    methods: ["GET", "POST", "OPTIONS"],
  },
});

const rooms = {};

io.on("connect", (socket) => {
  console.log("player connected");

  socket.on("selectRoom", ({ roomId }) => {
    console.log("select room");
    if (rooms[roomId] == undefined) {
      rooms[roomId] = new Map();
    }
    const players = rooms[roomId];
    socket.join(roomId);
    initGame(roomId, players, socket);
  });
});

function initGame(roomId, players, socket) {
  socket.on("msg", (data) => {
    console.log(JSON.stringify(data));
    console.log("socketId=", socket.id);
    data.name = idNameMap[socket.id];
    io.to(roomId).emit("message", data);
  });

  socket.on("auth", (data) => {
    console.log(JSON.stringify(data));
    idNameMap[data.id] = data.username;
    socket.emit("ack", data.username);
  });
  socket.on("disconnect", () => {
    console.log(`Player id = ${socket.id} left`);
    players.delete(socket);
  });
}
server.listen(3000, () => console.log("server running on port 3000"));
