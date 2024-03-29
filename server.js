const express = require("express");
const app = express();
const server = require("http").Server(app);
const PORT = process.env.PORT || 3000;
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId, userName);

    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message, userName);
    });
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userName);
    });
  });
});

server.listen(PORT, () => {
  console.log("Server Started at port :" + PORT);
});
