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
// Function checking if a piece is a king
function isKing(piece) {
    return piece && piece.type == _KING;
}

// Function copying an object
function copyObject(object) {
    let newObject = Object.assign({}, object);
    newObject.__proto__ = object.__proto__;
    return newObject;
}

// Function returning an opposite color
function getOppositeColor(color) {
    return color == TYPE_LIGHT ? TYPE_DARK : TYPE_LIGHT;
}

// Function getting a random number of range(min, max)
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}