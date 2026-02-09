const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const chatHistory = [];

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    socket.username = username;
    socket.emit("history", chatHistory);
  });

  socket.on("chatMessage", (msg) => {
    const fullMsg = {
      user: msg.user,
      text: msg.text,
      time: new Date().toLocaleTimeString()
    };

    chatHistory.push(fullMsg);
    if (chatHistory.length > 100) chatHistory.shift();

    io.emit("chatMessage", fullMsg);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
