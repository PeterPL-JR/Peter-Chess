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
        let move = this.moves.find(function(move) {
            return move.x == x && move.y == y;
        });
        if(move) {
            this.x = x;
            this.y = y;
            this.alreadyMoved = true;

            if(move.toCapture) {
                capturePiece(move.toCapture);
            }
            return true;
        }
        return false;
    }
    getMoves() {
        this.moves = [];
    }
    findCaptures() {
        for(let move of this.moves) {
            const piece = getPiece(move.x, move.y);

            if(piece && piece.color != this.color) {
                move.toCapture = piece;
            }
        }
    }
}

const DIR_LEFT = -1;
const DIR_RIGHT = 1;

// Subclasses of pieces
class _Pawn extends Piece {
    constructor(index, colorIndex) {
        super((colorIndex == TYPE_LIGHT) ? LIGHT_PAWNS_X : DARK_PAWNS_X, index, _PAWN, colorIndex);
        this.direction = (this.color == TYPE_LIGHT) ? DIR_RIGHT : DIR_LEFT;
    }

    move(x, y) {
        let pawnMoved = super.move(x, y);
        const LAST_PAWN_FIELD = (this.color == TYPE_LIGHT) ? FIELDS_IN_ROW - 1 : 0;

        if(pawnMoved && this.x == LAST_PAWN_FIELD) {
            this.getQueen();
        }
    }
    getMoves() {
        super.getMoves();
        
        const firstMove = this.tryGetMove(this.x + this.direction, this.y, false);
        if(firstMove && !this.alreadyMoved) {
            this.tryGetMove(this.x + this.direction * 2, this.y, false);
        }
        this.findCaptures();
    }
    getQueen() {
    }

    tryGetMove(x, y, canCapture) {
        let movePosition = getPos(x, y);
        movePosition.canCapture = canCapture;

        if(!getPiece(x, y)) {
            this.moves.push(movePosition);
            return true;
        }
        return false;
    }
    findCaptures() {
        super.findCaptures();

        this.findPawnCapture(-1);
        this.findPawnCapture(1);

        this.findPawnEnPassanteCapture();
    }

    findPawnCapture(captureDirectionY) {
        const move = getPos(this.x + this.direction, this.y + captureDirectionY);
        let pieceToCapture = getPiece(move.x, move.y);

        if(pieceToCapture && pieceToCapture.color != this.color) {
            move.toCapture = pieceToCapture;
            this.moves.push(move);
        }
    }
    findPawnEnPassanteCapture() {
    }
}

// Function moving a piece & updated the others
function movePiece(x, y, piece) {
    if(!isPosValid(x, y)) {
        return;
    }
    let move = {
        piece: piece,
        oldPosision: getPos(piece.x, piece.y),
        newPosition: getPos(x, y)
    };
    moves.push(move);

    piece.move(x, y);
    updateMoves();
}
function updateMoves() {
    for(let otherPiece of pieces) {
        otherPiece.getMoves();
    }
}

// Functions capturing a piece & removing it from the array
function capturePiece(piece) {
    removePiece(piece);
    capturedPieces.push(piece);
}
function removePiece(piece) {
    pieces.splice(pieces.indexOf(piece), 1);
}