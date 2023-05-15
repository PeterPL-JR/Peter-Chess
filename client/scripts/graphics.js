// Colors
const LIGHT_COLOR = "#e3c482";
const LIGHT_BORDER_COLOR = "#a08a5b";

const DARK_COLOR = "#653414";
const DARK_BORDER_COLOR = "#351c0c";

const CURSOR_DEFAULT = "var(--default)";
const CURSOR_POINTER = "var(--pointer)";

const COLORS = [];

const SELECTED_DEFAULT = 0;
const SELECTED_CAPTURING = 1;
const SELECTED_CHECK = 2;
const SELECTED_LAST_MOVE = 3;

function initColors() {
    COLORS[SELECTED_DEFAULT] = {
        field: "#aba888",
        border: "#737362"
    };
    COLORS[SELECTED_CAPTURING] = {
        field: "#7fc752",
        border: "#488a16"
    };
    COLORS[SELECTED_CHECK] = {
        field: "#c75f52",
        border: "#8a2816"
    };
    COLORS[SELECTED_LAST_MOVE] = {
        field: "#ffd13d",
        border: "#cb9b00"
    };
}

// Render Field
function renderFieldSelected(x, y, selectedFieldType) {
    var color = COLORS[selectedFieldType]['field'];
    var borderColor = COLORS[selectedFieldType]['border'];

    const X_POS = getBoardPos(x);
    const Y_POS = getBoardPos(y);

    ctx.fillStyle = borderColor;
    ctx.fillRect(X_POS, Y_POS, FIELD_SIZE, FIELD_SIZE);

    const INNER_X_POS = X_POS + BORDER_WIDTH;
    const INNER_Y_POS = Y_POS + BORDER_WIDTH;

    const INNER_SQUARE_SIZE = FIELD_SIZE - 2 * BORDER_WIDTH;
    ctx.fillStyle = color;
    ctx.fillRect(INNER_X_POS, INNER_Y_POS, INNER_SQUARE_SIZE, INNER_SQUARE_SIZE);
}
function renderFieldMarked(x, y) {
    const CURRENT_POS_BORDER_WIDTH = BORDER_WIDTH;
    const CURRENT_POS_FIELD_SIZE = FIELD_SIZE - CURRENT_POS_BORDER_WIDTH;
    const CURRENT_POS_COLOR = COLORS[SELECTED_LAST_MOVE]['border'];

    const posX = x * FIELD_SIZE + CURRENT_POS_BORDER_WIDTH / 2;
    const posY = y * FIELD_SIZE + CURRENT_POS_BORDER_WIDTH / 2;

    ctx.strokeStyle = CURRENT_POS_COLOR;
    ctx.lineWidth = CURRENT_POS_BORDER_WIDTH;

    ctx.beginPath();
    ctx.rect(posX, posY, CURRENT_POS_FIELD_SIZE, CURRENT_POS_FIELD_SIZE);
    ctx.stroke();
    ctx.closePath();
}

const MARKER_OPACITY = "2f";
const MARKER_COLOR = "#000000" + MARKER_OPACITY;

// Render possible moves markers of a piece moving by player
function renderPossibleMove(x, y) {
    const MARKER_RADIUS = FIELD_SIZE / 2 * 0.45;

    const CIRCLE_CENTER_X = x * FIELD_SIZE + FIELD_SIZE / 2;
    const CIRCLE_CENTER_Y = y * FIELD_SIZE + FIELD_SIZE / 2;

    ctx.fillStyle = MARKER_COLOR;
    ctx.beginPath();
    ctx.arc(CIRCLE_CENTER_X, CIRCLE_CENTER_Y, MARKER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}
function renderPossibleCapture(x, y) {
    const MARKER_BORDER_WIDTH = 6;
    const MARKER_RADIUS = FIELD_SIZE / 2 * 0.9 - MARKER_BORDER_WIDTH;

    const CIRCLE_CENTER_X = x * FIELD_SIZE + FIELD_SIZE / 2;
    const CIRCLE_CENTER_Y = y * FIELD_SIZE + FIELD_SIZE / 2;

    ctx.strokeStyle = MARKER_COLOR;
    ctx.lineWidth = MARKER_BORDER_WIDTH;

    ctx.beginPath();
    ctx.arc(CIRCLE_CENTER_X, CIRCLE_CENTER_Y, MARKER_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
}
function renderAllPossibleMoves(piece) {
    for(let move of piece.moves) {
        const renderFunction = (!move.toCapture) ? renderPossibleMove : renderPossibleCapture;
        renderFunction(move.x, move.y);
    }
}

// Try to render a check
function tryRenderCheck(board, colorType) {
    if(board.isCheck(colorType)) {
        let king = board.getKing(colorType);
        renderFieldSelected(king.x, king.y, SELECTED_CHECK);
    }
}

// Function loading images
function loadImage(path) {
    const img = document.createElement("img");
    img.src = "images/" + path;
    return img;
}