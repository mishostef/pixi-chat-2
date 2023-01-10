const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
const app = express();
const idNameMap = {};
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};
console.log(cors);
app.use(cors(corsOptions));

app.use("/", express.static(__dirname + "/dist"));
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:8081",
    ],
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
    console.log("players=", players);
    if (players.size >= 2) {
      socket.emit("error", "Room if full");
      socket.disconnect();
    } else {
      socket.join(roomId);
      initGame(roomId, players, socket);
    }
  });
});

function initGame(roomId, players, socket) {
  console.log("in init");
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
