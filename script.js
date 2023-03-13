const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const FIELD_SIZE = 80;
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

function init() {
    canvas.width = BOARD_SIZE;
    canvas.height = BOARD_SIZE;

    // Mouse down/up events
    canvas.onmousedown = function() {
        mouseClicked = true;
    }
    canvas.onmouseup = function() {
        mouseClicked = false;
        mouseReleased();
    }
    // Mouse moving event
    canvas.onmousemove = function(event) {
        mouseX = getMouseX(event);
        mouseY = getMouseY(event);

        if(choosenPiece == null) {
            mouseMove();
        }
    }
    
    initPieces();
    update();
}

function mouseMove() {
    const fieldPosition = getFieldPosition(mouseX, mouseY);
    const fieldTaken = isFieldTaken(fieldPosition.x, fieldPosition.y);
    
    canvas.style.cursor = fieldTaken ? CURSOR_POINTER : CURSOR_DEFAULT;
    if(mouseClicked && fieldTaken) {
        choosenPiece = getPiece(fieldPosition.x, fieldPosition.y);

        offsetX = mouseX - choosenPiece.x * FIELD_SIZE;
        offsetY = mouseY - choosenPiece.y * FIELD_SIZE;
    }
}
function mouseReleased() {
    choosenPiece = null;
}

// Update function
function update() {
    requestAnimationFrame(update);
    render();
}
// Render function
function render() {
    renderBoard();

    if(choosenPiece != null) {
        renderChoosePiece();
    }
}

// Render board & pieces
function renderBoard() {
    // Render board
    for(let x = 0; x < FIELDS_IN_ROW; x++){
        for(let y = 0; y < FIELDS_IN_ROW; y++){
            const MODULO_Y = y % 2 == 0 ? TYPE_LIGHT : TYPE_DARK;
            const MODULO_X = x % 2 != MODULO_Y;

            renderField(x, y, MODULO_X ? TYPE_LIGHT : TYPE_DARK);
        }
    }
    // Render pieces
    for(let piece of pieces) {
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

// Render a piece moving by player
function renderChoosePiece() {
    const choosenPieceX = mouseX - offsetX;
    const choosenPieceY = mouseY - offsetY;
    choosenPiece.renderOnCanvas(choosenPieceX, choosenPieceY);
}