const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const FIELD_SIZE = 90;
const BORDER_SIZE = FIELD_SIZE * 0.08;

const FIELDS_IN_ROW = 8;
const BOARD_SIZE = FIELD_SIZE * FIELDS_IN_ROW;

const TYPE_LIGHT = 0;
const TYPE_DARK = 1;

const IMAGE_PIECE_SIZE = 16;
const chessImage = loadImage("chess.png");

// Mouse
let mouseX = -1;
let mouseY = -1;

let mouseClicked = false;
let choosenPiece = null;
let selectedField = null;

let offsetX = -1;
let offsetY = -1;

let board = null;
let actions = [];

function init() {
    canvas.width = BOARD_SIZE;
    canvas.height = BOARD_SIZE;

    // Mouse down/up events
    canvas.onmousedown = function() {
        mouseClicked = true;
    }
    canvas.onmouseup = function() {
        mouseClicked = false;
        mouseUp();
    }
    // Mouse moving event
    canvas.onmousemove = function(event) {
        mouseX = getMouseX(event);
        mouseY = getMouseY(event);

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

    
    initColors();
    initPieces();

    board = new Board();
    update();
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
        board.movePiece(selectedField.x, selectedField.y, choosenPiece);
    }
    choosenPiece = null;
    selectedField = null;
}

// Update function
function update() {
    requestAnimationFrame(update);
    if(choosenPiece != null) {
        updateChoosenPiece();
    }
    render();
}
// Render function
function render() {
    renderBoard(board) ;

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

            if(selectedField != null && posEquals(selectedField, x, y)) {
                const pieceOnTheField = board.getPiece(selectedField.x, selectedField.y);
                const isCapturedPiece = pieceOnTheField && pieceOnTheField.color != choosenPiece.color;
                
                let selectedColor = isCapturedPiece ? SELECTED_CAPTURING : SELECTED_DEFAULT;
                let move = board.getMove(x, y, choosenPiece);
                
                if(!move) selectedColor = SELECTED_DEFAULT;
                else if(move.enPassante) selectedColor = SELECTED_CAPTURING;

                renderFieldSelected(x, y, selectedColor);
                continue;
            }
            renderField(x, y, MODULO_X ? TYPE_LIGHT : TYPE_DARK);
            
            if(choosenPiece && posEquals(choosenPiece, x, y)) {
                renderFieldCurrent(x, y);
            }
            tryRenderCheck(board, x, y);
        }
    }

    // Render possible moves
    for(let piece of board.pieces) {
        if(piece == choosenPiece) {
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

// Render Field
function renderField(x, y, colorIndex) {
    const X_POS = getBoardPos(x);
    const Y_POS = getBoardPos(y);

    const fieldColor = colorIndex == TYPE_LIGHT ? LIGHT_COLOR : DARK_COLOR;
    const borderColor = colorIndex == TYPE_LIGHT ? LIGHT_BORDER_COLOR : DARK_BORDER_COLOR;

    ctx.fillStyle = fieldColor;
    ctx.fillRect(X_POS, Y_POS, FIELD_SIZE, FIELD_SIZE);

    ctx.fillStyle = borderColor;
    ctx.fillRect(X_POS, Y_POS, BORDER_SIZE, FIELD_SIZE);
    ctx.fillRect(X_POS, Y_POS, FIELD_SIZE, BORDER_SIZE);
}

// Update/render a piece moving by player
function updateChoosenPiece() {
}
function renderChoosenPiece() {
    const position = getChoosenPiecePosition();
    choosenPiece.renderOnCanvas(position.x, position.y);
}

function addAction(action) {
    actions.push(action);
}
function lastAction() {
    return actions[actions.length - 1];
}