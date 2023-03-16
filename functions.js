// Function loading images
function loadImage(path) {
    const img = document.createElement("img");
    img.src = "images/" + path;
    return img;
}

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
function isPosValid(x, y) {
    return !(x < 0 || x >= FIELDS_IN_ROW || y < 0 || y >= FIELDS_IN_ROW);
}