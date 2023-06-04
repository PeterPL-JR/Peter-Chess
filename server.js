const express = require("express");
const app = express();

const http = require("http");
const path = require("path");

const {Server} = require("socket.io");
const server = http.createServer(app);

const io = new Server(server);
const PORT = 565;

const {Room} = require("./server/room");
const {getRandom} = require("./server/functions");

let rooms = {};
let players = [];

// Client path
app.use(express.static(
    path.join(__dirname + "/client/")
));

io.on("connection", function(socket) {
    let playerObj = initPlayer(socket);
    let playerCode = playerObj.code;

    socket.on("join-game", function(data) {
        if(isCodeValid(data)) {
            rooms[data.gameCode].joinPlayer(playerObj);
            socket.emit("join-game", {playerCode});
        }
    });
});

// Server listens on PORT
server.listen(PORT, function() {
    console.log("Listening on port " + PORT)
});


// Players functions
function initPlayer(socket) {
    const MIN_CODE = 1_000_000_000_000;
    const MAX_CODE = 9_999_999_999_999;

    let playerCode = getRandom(MIN_CODE, MAX_CODE);
    socket.playerCode = playerCode;

    let playerObject = {code: playerCode, socket};
    players.push(playerObject);
    return playerObject;
}

// Rooms functions
function initRoom(gameCode, board) {
    rooms[gameCode] = new Room(gameCode, board);
}
function isCodeValid(data) {
    let gameCode = data.gameCode;
    let board = data.board;

    if(!gameCode) return false;

    if(!rooms[gameCode]) {
        initRoom(gameCode, board);
        return true;
    }
    return rooms[gameCode].players.length < 2;
}