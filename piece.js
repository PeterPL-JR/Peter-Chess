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

const BEGIN_CHESS_ORDER = [_ROOK, _KNIGHT, _BISHOP, _KING, _QUEEN, _BISHOP, _KNIGHT, _ROOK];
const CLASSES_OF_PIECES = [];

// Positions of pieces
const LIGHT_PIECES_X = 0;
const DARK_PIECES_X = FIELDS_IN_ROW - 1;

const LIGHT_PAWNS_X = 1;
const DARK_PAWNS_X = FIELDS_IN_ROW - 2;

// Init pieces
function initPieces() {
    CLASSES_OF_PIECES[_Pawn] = _Pawn;
    
    CLASSES_OF_PIECES[_ROOK] = _Rook;
    CLASSES_OF_PIECES[_KNIGHT] = _Knight;
    CLASSES_OF_PIECES[_BISHOP] = _Bishop;

    CLASSES_OF_PIECES[_QUEEN] = _Queen;
    CLASSES_OF_PIECES[_KING] = _King;

    // Pawns
    for(let i = 0; i < FIELDS_IN_ROW; i++) {
        pieces.push(new _Pawn(i, TYPE_LIGHT));
        pieces.push(new _Pawn(i, TYPE_DARK));
    }

    // Other pieces
    for(let i = 0; i < FIELDS_IN_ROW; i++) {
        const pieceType = BEGIN_CHESS_ORDER[i];

        pieces.push(new CLASSES_OF_PIECES[pieceType](LIGHT_PIECES_X, i, TYPE_LIGHT));
        pieces.push(new CLASSES_OF_PIECES[pieceType](DARK_PIECES_X, i, TYPE_DARK));
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
        this.lastMove = null;

        this.moves = [];
        this.attacked = [];
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
        let move = getMove(x, y, this);

        if(move) {
            this.lastMove = {
                piece: this,
                oldPosision: getPos(this.x, this.y),
                newPosition: getPos(x, y)
            };

            this.x = x;
            this.y = y;
            this.alreadyMoved = true;

            if(move.toCapture) {
                this.lastMove.captured = move.toCapture;
                capturePiece(move.toCapture);
            }
            addAction(this.lastMove);
            return true;
        }
        return false;
    }
    getMoves() {
        this.moves = [];
        this.attacked = [];
    }
    tryGetMove(x, y) {
        const thisColorPiece = getPiece(x, y, this.color);

        if(posValid(x, y)) {
            let position = getPos(x, y);
            this.attacked.push(position);

            if(!thisColorPiece && !isKing(x, y)) {
                this.moves.push(position);
                return true;
            }
        }
        return false;
    }
    findCaptures() {
        for(let move of this.moves) {
            const piece = getPiece(move.x, move.y);

            if(piece && piece.color != this.color) {
                move.toCapture = piece;
            }
        }
    }
    isAttacked() {
        return isFieldAttacked(this.x, this.y, getOppositeColor(this.color));
    }
}

const HORIZONTAL = 0;
const VERTICAL = 1;

const DIR_LEFT = -1;
const DIR_RIGHT = 1;

// Subclasses of pieces
class _Pawn extends Piece {
    constructor(indexY, colorIndex) {
        super((colorIndex == TYPE_LIGHT) ? LIGHT_PAWNS_X : DARK_PAWNS_X, indexY, _PAWN, colorIndex);
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
        
        const firstMove = this.tryGetMove(this.x + this.direction, this.y);
        if(firstMove && !this.alreadyMoved) {
            this.tryGetMove(this.x + this.direction * 2, this.y);
        }
        this.findCaptures();
    }
    getQueen() {
        removePiece(this);
        pieces.push(new _Queen(this.x, this.y, this.color));
    }

    tryGetMove(x, y) {
        let movePosition = getPos(x, y);

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

        this.findPawnEnPassanteCapture(-1);
        this.findPawnEnPassanteCapture(1);
    }

    findPawnCapture(captureDirectionY) {
        const move = getPos(this.x + this.direction, this.y + captureDirectionY);
        let pieceToCapture = getPiece(move.x, move.y);

        this.attacked.push(move);
        if(pieceToCapture && pieceToCapture.color != this.color && !isKing(move.x, move.y)) {
            move.toCapture = pieceToCapture;
            this.tryGetPawnCapture(move);
        }
    }
    findPawnEnPassanteCapture(captureDirectionY) {
        let piece = getPiece(this.x, this.y + captureDirectionY);

        if(piece && piece.type == _PAWN && piece.color != this.color) {
            let lastMove = piece.lastMove;

            if(lastMove && piece == lastAction().piece) {
                let requiredX = lastMove.newPosition.x - piece.direction * 2;
                let requiredY = piece.y;

                if(posEquals(lastMove.oldPosision, requiredX, requiredY)) {
                    let moveX = this.x + this.direction;
                    let moveY = this.y + captureDirectionY;

                    let enPassanteMove = getPos(moveX, moveY);
                    enPassanteMove.toCapture = piece;
                    enPassanteMove.enPassante = true;

                    this.tryGetPawnCapture(enPassanteMove);
                    return true;
                }
            }
        }
        return false;
    }
    tryGetPawnCapture(move) {
        this.moves.push(move);
    }
}

class _Rook extends Piece {
    constructor(x, y, colorIndex) {
        super(x, y, _ROOK, colorIndex);
    }
    getMoves() {
        super.getMoves();

        getAllStraightMoves(this);
        this.findCaptures();
    }
}
class _Knight extends Piece {
    constructor(x, y, colorIndex) {
        super(x, y, _KNIGHT, colorIndex);
    }
    getMoves() {
        super.getMoves();

        this.getKnightMove(1, HORIZONTAL);
        this.getKnightMove(-1, HORIZONTAL);

        this.getKnightMove(1, VERTICAL);
        this.getKnightMove(-1, VERTICAL);
       
        this.findCaptures();
    }
    getKnightMove(direction, moveType) {
        let dirs = getDirections(direction, moveType);
        
        let straightX = this.x + dirs.x * 2;
        let straightY = this.y + dirs.y * 2;

        this.tryGetMove(straightX + dirs.y, straightY + dirs.x);
        this.tryGetMove(straightX - dirs.y, straightY - dirs.x);
    }
}
class _Bishop extends Piece {
    constructor(x, y, colorIndex) {
        super(x, y, _BISHOP, colorIndex);
    }
    getMoves() {
        super.getMoves();

        getAllDiagonalMoves(this);
        this.findCaptures();
    }
}

class _King extends Piece {
    constructor(x, y, colorIndex) {
        super(x, y, _KING, colorIndex);
    }
    move(x, y) {
        super.move(x, y);

        let move = getMove(x, y, this);
        if(move && move.castling) {
            this.doCastling(move.castling);
        }
    }
    getMoves() {
        super.getMoves();
        for(let x = -1; x <= 1; x++) {
            for(let y = -1; y <= 1; y++) {
                if(x == 0 && y == 0) continue;
                let xPos = this.x + x;
                let yPos = this.y + y;
                
                this.tryGetMove(xPos, yPos);
            }
        }

        let rooks = getPiecesOfType(_ROOK, this.color);
        this.tryGetCastling(rooks[0]);
        this.tryGetCastling(rooks[1]);

        this.findCaptures();
    }
    tryGetMove(x, y) {
        if(!isFieldAttacked(x, y, getOppositeColor(this.color))) {
            super.tryGetMove(x, y);
        } else {
            this.attacked.push(getPos(x, y));
        }
    }
    tryGetCastling(rook) {
        if(!rook) return;
        
        let kingY = this.y;
        let rookY = rook.y;

        let alreadyMoved = rook.alreadyMoved || this.alreadyMoved;
        let attacked = this.isAttacked() || rook.isAttacked();

        if(!alreadyMoved && !attacked) {
            let beginY = ((kingY > rookY) ? rookY : kingY) + 1;
            let endY = ((kingY > rookY) ? kingY : rookY) - 1;

            let direction = (kingY > rookY) ? -1 : 1;
            
            for(let y = beginY; y <= endY; y++) {
                let isThisFieldAttacked = isFieldAttacked(this.x, y, getOppositeColor(this.color));
                let isThisFieldTaken = isFieldTaken(this.x, y);

                if(isThisFieldAttacked || isThisFieldTaken) return;
            }

            let castlingX = this.x;
            let castlingY = this.y + 2 * direction;

            let rookCastlingX = rook.x;
            let rookCastlingY = castlingY - direction;

            let move = getPos(castlingX, castlingY);
            move.castling = {
                rook: rook,
                rookX: rookCastlingX,
                rookY: rookCastlingY
            };
            this.moves.push(move);
        }
    }
    doCastling(castling) {
        movePiece(castling.rookX, castling.rookY, castling.rook);
    }
}
class _Queen extends Piece {
    constructor(x, y, colorIndex) {
        super(x, y, _QUEEN, colorIndex);
    }
    getMoves() {
        super.getMoves();

        getAllStraightMoves(this);
        getAllDiagonalMoves(this);
        this.findCaptures();
    }
}

// Straight (horizontally/vertically) moves
function getStraightMoves(piece, direction, moveType) {
    let dirs = getDirections(direction, moveType);

    for(let i = 0; i < FIELDS_IN_ROW; i++) {
        let posX = piece.x + dirs.x * i;
        let posY = piece.y + dirs.y * i;

        if(posEquals(piece, posX, posY)) continue;
        if(!tryAddMove(piece, posX, posY)) {
            return;
        }
    }
}
// Diagonal moves
function getDiagonalMoves(piece, directionX, directionY) {
    for(let x = 0; x < FIELDS_IN_ROW; x++) {
        for(let y = 0; y < FIELDS_IN_ROW; y++) {
            if(x == y) {
                let posX = piece.x + x * directionX;
                let posY = piece.y + y * directionY;

                if(posEquals(piece, posX, posY)) continue;
                if(!tryAddMove(piece, posX, posY)) {
                    return;
                }
            }
        }
    }
}

function getAllStraightMoves(piece) {
    getStraightMoves(piece, 1, HORIZONTAL);
    getStraightMoves(piece, -1, HORIZONTAL);

    getStraightMoves(piece, 1, VERTICAL);
    getStraightMoves(piece, -1, VERTICAL);
}
function getAllDiagonalMoves(piece) {
    getDiagonalMoves(piece, 1,1);
    getDiagonalMoves(piece, 1,-1);

    getDiagonalMoves(piece, -1,1);
    getDiagonalMoves(piece, -1,-1);
}

function tryAddMove(piece, posX, posY) {
    let pieceOnPosition = getPiece(posX, posY);

    piece.tryGetMove(posX, posY);
    if(!posValid(posX, posY) || pieceOnPosition) {
        return false;
    }
    return true;
}

// Function moving a piece & updated the others
function movePiece(x, y, piece) {
    if(!posValid(x, y)) {
        return;
    }

    piece.move(x, y);
    updateMoves();
}
function updateMoves() {
    for(let piece of pieces) {
        piece.getMoves();
    }
    getKing(TYPE_LIGHT).getMoves();
    getKing(TYPE_DARK).getMoves();
}

// Functions capturing a piece & removing it from the array
function capturePiece(piece) {
    removePiece(piece);
    capturedPieces.push(piece);
}
function removePiece(piece) {
    pieces.splice(pieces.indexOf(piece), 1);
}

function isCheck(kingColor) {
    return getKing(kingColor).isAttacked();
}