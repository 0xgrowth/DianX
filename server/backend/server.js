const express = require("express");
const app = express();
var cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});
require('sqlite3')


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));
app.use(express.static("media"));

const PORT = process.env.PORT || 9339;

// Route Setup
const apiRoutev1 = require("./routes/api/v1/route");

app.use((req, res, next) => {
  if (req.url.substring(0, 4) !== "/api") {
    return res.sendFile(__dirname + "/static/index.html");
  }
  next();
});

app.use("/api/v1", apiRoutev1);

io.on("connection", (socket) => {
  app.set("socket", socket);

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("make_handshake", (data) => {});
  // socket.on("send_message", (data) => {});

  socket.on("leave_room", (data) => {
    socket.leave(data);
  });

  socket.on("receive_text", (data) => {
    socket.broadcast.emit("send_message", data);
    // socket.to(data.room).emit("receive_message", data);
    console.log("message recieved");
  });
});

// Server listening to port 3000
server.listen(PORT, () => {
  console.log("REST API is Running on", PORT);
  app.set("LISTENING", PORT);
});

module.exports = app
