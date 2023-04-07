const express = require("express");
const app = express();

const http = require("http");
const path = require("path");

const {Server} = require("socket.io");
const server = http.createServer(app);

const io = new Server(server);
const PORT = 565;

// Client path
app.use(express.static(
    path.join(__dirname + "/client/")
));

// Server listens on PORT
server.listen(PORT, function() {
    console.log("Listening on port " + PORT)
});