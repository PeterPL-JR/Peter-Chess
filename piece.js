// Types of pieces
const _PAWN = 0;

const _ROOK = 1;
const _KNIGHT = 2;
const _BISHOP = 3;

const _QUEEN = 4;
const _KING = 5;

// Players pieces arrays
const pieces = [];
const capturedPieces = [];

const BEGIN_PIECES_ORDER = [_ROOK, _KNIGHT, _BISHOP, _KING, _QUEEN, _BISHOP, _KNIGHT, _ROOK];

// Positions of pieces
const LIGHT_PIECES_X = 0;
const DARK_PIECES_X = FIELDS_IN_ROW - 1;

const LIGHT_PAWNS_X = 1;
const DARK_PAWNS_X = FIELDS_IN_ROW - 2;

// Init pieces
function initPieces() {

    // Pawns
    for(let i = 0; i < FIELDS_IN_ROW; i++) {
        pieces.push(new _Pawn(i, TYPE_LIGHT));
        pieces.push(new _Pawn(i, TYPE_DARK));
    }

    // Other pieces
    for(let i = 0; i < BEGIN_PIECES_ORDER.length; i++) {
        const pieceType = BEGIN_PIECES_ORDER[i];
        pieces.push(new Piece(LIGHT_PIECES_X, i, pieceType, TYPE_LIGHT));
        pieces.push(new Piece(DARK_PIECES_X, i, pieceType, TYPE_DARK));
    }

    for(let piece of pieces) {
        piece.getMoves();
    }
}

// Class of Piece
class Piece {
    constructor(beginX, beginY, typeIndex, colorIndex) {
        this.type = typeIndex;
        this.color = colorIndex;
        
        this.x = beginX;
        this.y = beginY;
        this.alreadyMoved = false;

        this.moves = [];
    }
    render() {
        this.renderOnCanvas(getBoardPos(this.x), getBoardPos(this.y));
    }
    renderOnCanvas(x, y) {
        const CUT_X = this.type * IMAGE_PIECE_SIZE;
        const CUT_Y = this.color * IMAGE_PIECE_SIZE;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(chessImage, CUT_X, CUT_Y, IMAGE_PIECE_SIZE, IMAGE_PIECE_SIZE, x, y, FIELD_SIZE, FIELD_SIZE);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.alreadyMoved = true;
    }
    getMoves() {
        this.moves = [];
    }
}

// Subclasses of pieces
class _Pawn extends Piece {
    constructor(index, colorIndex) {
        super((colorIndex == TYPE_LIGHT) ? LIGHT_PAWNS_X : DARK_PAWNS_X, index, _PAWN, colorIndex);
        this.alreadyMoved = false;
    }
    getMoves() {
        super.getMoves();
        const DIR_LEFT = -1;
        const DIR_RIGHT = 1;

        const direction = (this.color == TYPE_LIGHT) ? DIR_RIGHT : DIR_LEFT;
        this.moves.push(getPos(this.x + direction, this.y));
    }
}

// Function moving a piece & updated the others
function movePiece(x, y, piece) {
    piece.move(x, y);

    for(let otherPiece of pieces) {
        otherPiece.getMoves();
    }
}