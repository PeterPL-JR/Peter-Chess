// Functions getting mouse position on the canvas
function getMouseX(event) {
    return event.clientX - canvas.offsetLeft;
}
function getMouseY(event) {
    return event.clientY - canvas.offsetTop;
}
// Function getting moving piece position
function getChoosenPiecePosition() {
    return {
        x: mouseX - offsetX,
        y: mouseY - offsetY
    }
}

// Function finding a piece with position(x, y)
function getPiece(fieldX, fieldY, color=null) {
    for(let piece of pieces) {
        const colorCondition = (color != null) ? (piece.color == color) : true;

        if(piece.x == fieldX && piece.y == fieldY && colorCondition) {
            return piece;
        }
    }
    return null;
}
function getMove(fieldX, fieldY, piece) {
    for(let move of piece.moves) {
        if(move.x == fieldX && move.y == fieldY) {
            return move;
        }
    }
    return null;
}

function isKing(x, y) {
    let piece = getPiece(x, y);
    return piece && piece.type == _KING;
}

// Function checking if a field with position(x, y) is taken
function isFieldTaken(fieldX, fieldY) {
    return getPiece(fieldX, fieldY) ? true : false; 
}

// Function getting field position under cursor
function getFieldPosition(canvasX, canvasY) {
    const x = Math.floor(canvasX / FIELD_SIZE);
    const y = Math.floor(canvasY / FIELD_SIZE);
    return {x, y};
}
// Function getting position on canvas from field index
function getBoardPos(pos) {
    return pos * FIELD_SIZE;
}

// Function getting an object of position(x, y);
function getPos(x, y) {
    return {x, y};
}

// Function getting direction(x, y) based on moveType(HORIZONTAL/VERTICAL) & direction(1/-1) 
function getDirections(dir, moveType) {
    return {
        x: moveType == HORIZONTAL ? dir : 0,
        y: moveType == HORIZONTAL ? 0 : dir
    } 
}
// Function checking if a position is not out of bounds
function posValid(x, y) {
    return !(x < 0 || x >= FIELDS_IN_ROW || y < 0 || y >= FIELDS_IN_ROW);
}
// Function checking if a position equals an another position(x, y)
function posEquals(pos, x, y) {
    return pos.x == x && pos.y == y;
}

// Function returning type of an object
function getType(object) {
    return object.constructor.name;
}