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

// Function finding a piece with position(x, y)
function getPiece(fieldX, fieldY) {
    for(let piece of pieces) {
        if(piece.x == fieldX && piece.y == fieldY) {
            return piece;
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