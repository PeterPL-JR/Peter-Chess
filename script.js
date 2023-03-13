const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const FIELD_SIZE = 90;
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

// Colors
const LIGHT_COLOR = "#e3c482";
const LIGHT_BORDER_COLOR = "#a08a5b";

const DARK_COLOR = "#653414";
const DARK_BORDER_COLOR = "#351c0c";
const BORDER_SIZE = FIELD_SIZE * 0.08;

const CURSOR_DEFAULT = "var(--default)";
const CURSOR_POINTER = "var(--pointer)";

const SELECTED_COLOR = "#aba888";
const SELECTED_BORDER_COLOR = "#737362";

const SELECTED_COLOR_CAPTURING = "#7fc752";
const SELECTED_BORDER_COLOR_CAPTURING = "#488a16";

function init() {
    canvas.width = BOARD_SIZE;
    canvas.height = BOARD_SIZE;

    // Mouse down/up events
    canvas.onmousedown = function() {
        mouseClicked = true;
    }
    canvas.onmouseup = canvas.onmouseleave = function() {
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
    
    initPieces();
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
    const fieldTaken = isFieldTaken(fieldPosition.x, fieldPosition.y);

    canvas.style.cursor = fieldTaken ? CURSOR_POINTER : CURSOR_DEFAULT;
    if(mouseClicked && fieldTaken) {
        choosenPiece = getPiece(fieldPosition.x, fieldPosition.y);

        offsetX = mouseX - choosenPiece.x * FIELD_SIZE;
        offsetY = mouseY - choosenPiece.y * FIELD_SIZE;        
    }
}
function mouseUp() {
    if(choosenPiece != null && selectedField != null) {
        movePiece(selectedField.x, selectedField.y, choosenPiece);
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
    renderBoard();

    if(choosenPiece != null) {
        renderChoosenPiece();
    }
}

// Render board & pieces
function renderBoard() {
    // Render board
    for(let x = 0; x < FIELDS_IN_ROW; x++) {
        for(let y = 0; y < FIELDS_IN_ROW; y++) {
            const MODULO_Y = y % 2 == 0 ? TYPE_LIGHT : TYPE_DARK;
            const MODULO_X = x % 2 != MODULO_Y;

            if(selectedField != null && selectedField.x == x && selectedField.y == y) {
                const pieceOnTheField = getPiece(selectedField.x, selectedField.y);
                const isCapturedPiece = pieceOnTheField && pieceOnTheField.color != choosenPiece.color;

                renderFieldSelected(x, y, isCapturedPiece ? SELECTED_CAPTURING : SELECTED_DEFAULT);
                continue;
            }
            renderField(x, y, MODULO_X ? TYPE_LIGHT : TYPE_DARK);
        }
    }
    // Render pieces
    for(let piece of pieces) {
        if(piece != choosenPiece) {
            piece.render();
        } else {
            renderAllPossibleMoves(piece);
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

const SELECTED_DEFAULT = 0;
const SELECTED_CAPTURING = 1;

function renderFieldSelected(x, y, selectedFieldType) {
    const color = (selectedFieldType == SELECTED_DEFAULT) ? SELECTED_COLOR : SELECTED_COLOR_CAPTURING;
    const borderColor = (selectedFieldType == SELECTED_DEFAULT) ? SELECTED_BORDER_COLOR : SELECTED_BORDER_COLOR_CAPTURING;

    const X_POS = getBoardPos(x);
    const Y_POS = getBoardPos(y);

    ctx.fillStyle = borderColor;
    ctx.fillRect(X_POS, Y_POS, FIELD_SIZE, FIELD_SIZE);

    const INNER_X_POS = X_POS + BORDER_SIZE;
    const INNER_Y_POS = Y_POS + BORDER_SIZE;

    const INNER_SQUARE_SIZE = FIELD_SIZE - 2 * BORDER_SIZE;
    ctx.fillStyle = color;
    ctx.fillRect(INNER_X_POS, INNER_Y_POS, INNER_SQUARE_SIZE, INNER_SQUARE_SIZE);
}

// Render possible moves markers of a piece moving by player
function renderPossibleMove(x, y) {
    const MARKER_RADIUS = FIELD_SIZE / 2 * 0.45;
    const MARKER_COLOR = "#00000055";

    const CIRCLE_CENTER_X = x * FIELD_SIZE + FIELD_SIZE / 2;
    const CIRCLE_CENTER_Y = y * FIELD_SIZE + FIELD_SIZE / 2;

    ctx.fillStyle = MARKER_COLOR;
    ctx.beginPath();
    ctx.arc(CIRCLE_CENTER_X, CIRCLE_CENTER_Y, MARKER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}
function renderAllPossibleMoves(piece) {
    for(let move of piece.moves) {
        renderPossibleMove(move.x, move.y);
    }
}

// Update/render a piece moving by player
function updateChoosenPiece() {
}
function renderChoosenPiece() {
    const position = getChoosenPiecePosition();
    choosenPiece.renderOnCanvas(position.x, position.y);
}