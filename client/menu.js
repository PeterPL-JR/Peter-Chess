// Containers
const menuContent = document.getElementById("menu-content");
const chessContent = document.getElementById("chess-content");

const buttonsDiv = document.getElementById("buttons-div");
const joinDiv = document.getElementById("join-div");

const gameCodeInput = document.getElementById("code-input");
const joinButton = document.getElementById("join-button");

// Buttons
const oneBoardButton = document.getElementById("button-one-board");
const playOnlineButton = document.getElementById("play-online-board");
const userIcon = document.getElementById("user-icon");

const MENU_BOARD_SIZE = 640;

function init() {
    setCanvasSize(MENU_BOARD_SIZE);
    oneBoardButton.onclick = startGame;
    playOnlineButton.onclick = joinMenu;

    userIcon.onmouseenter = function() {
        userIcon.src = "images/user_icon_hover.png";
    }
    userIcon.onmouseleave = function() {
        userIcon.src = "images/user_icon.png";
    }

    initColors();
    initPieces();

    board = new Board();
    update();
}

function joinMenu() {
    buttonsDiv.style.display = "none";
    joinDiv.style.display = "block";

    joinButton.onclick = clickJoinGame;
}

function clickJoinGame() {
    let gameCode = parseInt(gameCodeInput.value);
    
    socket = io();
    socket.emit("join-game", {gameCode});
}