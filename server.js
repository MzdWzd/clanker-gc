const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const chatHistory = [];

io.on("connection", (socket) => {
  socket.username = "Anonymous";

  socket.emit("history", chatHistory);

  socket.on("chatMessage", (msg) => {
    const text = msg.text.trim();

    if (text.startsWith("/name ")) {
      const newName = text.slice(6).trim();
      if (!newName) return;

      const oldName = socket.username;
      socket.username = newName;

      const notice = {
        user: "system",
        text: `${oldName} is now ${newName}`,
        time: new Date().toLocaleTimeString()
      };

      chatHistory.push(notice);
      io.emit("chatMessage", notice);
      return;
    }

    if (text === "/whoami") {
      socket.emit("chatMessage", {
        user: "system",
        text: `you are ${socket.username}`,
        time: new Date().toLocaleTimeString()
      });
      return;
    }

    const fullMsg = {
      user: socket.username,
      text,
      time: new Date().toLocaleTimeString()
    };

    chatHistory.push(fullMsg);
    if (chatHistory.length > 100) chatHistory.shift();

    io.emit("chatMessage", fullMsg);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("server running on", PORT);
});
