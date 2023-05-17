const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Containers
const menuContent = document.getElementById("menu-content");
const chessContent = document.getElementById("chess-content");

// Buttons
const oneBoardButton = document.getElementById("button-one-board");
const playOnlineButton = document.getElementById("play-online-board");

const GAME_BOARD_SIZE = 720;
const MENU_BOARD_SIZE = 640;

let BOARD_SIZE, FIELD_SIZE;
const FIELDS_IN_ROW = 8;

const SCALE_OF_BORDER = 0.08;
let BORDER_WIDTH = FIELD_SIZE * SCALE_OF_BORDER;

const TYPE_LIGHT = 0;
const TYPE_DARK = 1;

const IMAGE_PIECE_SIZE = 16;
const chessImage = loadImage("chess.png");

// Mouse
let mouseX = -1;
let mouseY = -1;
let boardBlocked = false;

let mouseClicked = false;
let choosenPiece = null;
let selectedField = null;

let turn = TYPE_LIGHT;

let offsetX = -1;
let offsetY = -1;

let board = null;
let actions = [];
let end = false;

function init() {
    setCanvasSize(MENU_BOARD_SIZE);
    oneBoardButton.onclick = startGame;

    initColors();
    initPieces();

    board = new Board();
    update();
}

function initGame() {
    setCanvasSize(GAME_BOARD_SIZE);

    // Mouse down/up events
    canvas.onmousedown = function() {
        if(boardBlocked) return;
        mouseClicked = true;
    }
    canvas.onmouseup = function() {
        if(boardBlocked) return;
        mouseClicked = false;
        mouseUp();
    }
    // Mouse moving event
    canvas.onmousemove = function(event) {
        if(boardBlocked) return;
        mouseX = getMouseX(event);
        mouseY = getMouseY(event);
        if(end) return;
        
        if(choosenPiece == null) {
            mouseMoveFirst();
        } else {
            mouseMovePiece();
        }
    }
    
    canvas.onmouseleave = function() {
        mouseClicked = false;
        choosenPiece = null;
        selectedField = null;
    }
    canvas.oncontextmenu = function() {
        return false;
    }
}

function startGame() {
    initGame();

    chessContent.classList.remove("menu-div");
    menuContent.remove();
}

function setCanvasSize(size) {
    canvas.width = size;
    canvas.height = size;

    BOARD_SIZE = size;
    FIELD_SIZE = BOARD_SIZE / FIELDS_IN_ROW;
    BORDER_WIDTH = FIELD_SIZE * SCALE_OF_BORDER;
}

function mouseMovePiece() {
    const choosenPiecePosition = getChoosenPiecePosition();
    const PIECE_CENTER_X = choosenPiecePosition.x + FIELD_SIZE / 2;
    const PIECE_CENTER_Y = choosenPiecePosition.y + FIELD_SIZE / 2;

    selectedField = getFieldPosition(PIECE_CENTER_X, PIECE_CENTER_Y);
}
function mouseMoveFirst() {
    const fieldPosition = getFieldPosition(mouseX, mouseY);
    const fieldTaken = board.isFieldTaken(fieldPosition.x, fieldPosition.y);

    canvas.style.cursor = fieldTaken ? CURSOR_POINTER : CURSOR_DEFAULT;
    if(mouseClicked && fieldTaken) {
        choosenPiece = board.getPiece(fieldPosition.x, fieldPosition.y);

        offsetX = mouseX - choosenPiece.x * FIELD_SIZE;
        offsetY = mouseY - choosenPiece.y * FIELD_SIZE;        
    }
}
function mouseUp() {
    if(choosenPiece != null && selectedField != null) {
        tryMovePiece(choosenPiece, selectedField);
    }
    choosenPiece = null;
    selectedField = null;
}

// Update function
function update() {
    requestAnimationFrame(update);
    if(!end && choosenPiece != null) {
        updateChoosenPiece();
    }
    render();
}
// Render function
function render() {
    renderBoard(board);

    if(choosenPiece != null) {
        renderChoosenPiece();
    }
}

// Render board & pieces
function renderBoard(board) {
    // Render board
    for(let x = 0; x < FIELDS_IN_ROW; x++) {
        for(let y = 0; y < FIELDS_IN_ROW; y++) {
            const MODULO_Y = y % 2 == 0 ? TYPE_LIGHT : TYPE_DARK;
            const MODULO_X = x % 2 != MODULO_Y;
            renderField(x, y, MODULO_X ? TYPE_LIGHT : TYPE_DARK);
        }
    }
    renderLastAction();

    if(choosenPiece && isTurn(choosenPiece.color)) {
        renderFieldMarked(choosenPiece.x, choosenPiece.y);
    }
    if(choosenPiece && selectedField && isTurn(choosenPiece.color)) {
        renderChoosenField();
    }

    tryRenderCheck(board, TYPE_LIGHT);
    tryRenderCheck(board, TYPE_DARK);

    // Render possible moves
    for(let piece of board.pieces) {
        if(piece == choosenPiece && isTurn(piece.color)) {
            renderAllPossibleMoves(piece);
        }
    }
    // Render pieces
    for(let piece of board.pieces) {
        if(piece != choosenPiece) {
            piece.render();
        }
    }
}

// Render field
function renderField(x, y, colorIndex) {
    const X_POS = getBoardPos(x);
    const Y_POS = getBoardPos(y);

    const fieldColor = colorIndex == TYPE_LIGHT ? LIGHT_COLOR : DARK_COLOR;
    const borderColor = colorIndex == TYPE_LIGHT ? LIGHT_BORDER_COLOR : DARK_BORDER_COLOR;

    ctx.fillStyle = fieldColor;
    ctx.fillRect(X_POS, Y_POS, FIELD_SIZE, FIELD_SIZE);

    ctx.fillStyle = borderColor;
    ctx.fillRect(X_POS, Y_POS, BORDER_WIDTH, FIELD_SIZE);
    ctx.fillRect(X_POS, Y_POS, FIELD_SIZE, BORDER_WIDTH);
}

// Render field choosen to move to 
function renderChoosenField() {
    const pieceOnTheField = board.getPiece(selectedField.x, selectedField.y);
    const isCapturedPiece = pieceOnTheField && pieceOnTheField.color != choosenPiece.color;
    
    let selectedColor = isCapturedPiece ? SELECTED_CAPTURING : SELECTED_DEFAULT;
    let move = board.getMove(selectedField.x, selectedField.y, choosenPiece);
    
    if(!move) selectedColor = SELECTED_DEFAULT;
    else if(move.enPassante) selectedColor = SELECTED_CAPTURING;
    
    renderFieldSelected(selectedField.x, selectedField.y, selectedColor);
}

// Update/render a piece moving by player
function updateChoosenPiece() {
}
function renderChoosenPiece() {
    const position = getChoosenPiecePosition();
    choosenPiece.renderOnCanvas(position.x, position.y);
}

function tryMovePiece(piece, pos) {
    if(isTurn(piece.color)) {
        let isMoved = board.movePiece(pos.x, pos.y, piece, false);
        if(isMoved) {
            changeTurn();
            addAction(piece.color, piece, piece.lastMove);
        }
    }
}

// Adding action to the array
function addAction(colorType, piece, action) {
    let last = lastAction();
    if(last && last.action.castling && action.castling) {
        return;
    }
    actions.push({
        player: colorType,
        piece: piece,
        action: action
    })
}
// Last action
function lastAction() {
    return actions[actions.length - 1];
}

// Render last action
function renderLastAction() {
    let last = lastAction();
    if(last) {
        renderFieldMarked(last.action.oldPos.x, last.action.oldPos.y);
        renderFieldSelected(last.action.newPos.x, last.action.newPos.y, SELECTED_LAST_MOVE);
    }
}

function isTurn(colorType) {
    return turn == colorType;
}
function changeTurn() {
    turn = (turn == TYPE_LIGHT) ? TYPE_DARK : TYPE_LIGHT;
}

// Draw
function draw() {
    end = true;
    console.log("Draw!");
}
// Victory
function victory(playerColor) {
    end = true;
    console.log("Victory! " + playerColor)
}