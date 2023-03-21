class Board {
    constructor() {
        // Players pieces arrays
        this.pieces = [];
        this.capturedPieces = [];
    
        // Pawns
        for(let i = 0; i < FIELDS_IN_ROW; i++) {
            this.pieces.push(new _Pawn(i, TYPE_LIGHT, this));
            this.pieces.push(new _Pawn(i, TYPE_DARK, this));
        }

        // Other pieces
        for(let i = 0; i < FIELDS_IN_ROW; i++) {
            const pieceType = BEGIN_CHESS_ORDER[i];

            this.pieces.push(new CLASSES_OF_PIECES[pieceType](LIGHT_PIECES_X, i, TYPE_LIGHT, this));
            this.pieces.push(new CLASSES_OF_PIECES[pieceType](DARK_PIECES_X, i, TYPE_DARK, this));
        }

        for(let piece of this.pieces) {
            piece.getMoves();
        }
    }

    // Method moving a piece & updated the others
    movePiece(x, y, piece, castling=false) {
        if(!posValid(x, y)) {
            return;
        }
        
        let isMoved = piece.move(x, y, castling);
        this.updateMoves();
        
        return isMoved;
    }
    updateMoves() {
        for(let piece of this.pieces) {
            piece.getMoves();
        }
        this.getKing(TYPE_LIGHT).getMoves();
        this.getKing(TYPE_DARK).getMoves();
    }

    // Methods capturing a piece & removing it from the array
    capturePiece(piece) {
        this.removePiece(piece);
        this.capturedPieces.push(piece);
    }
    removePiece(piece) {
        this.pieces.splice(this.pieces.indexOf(piece), 1);
    }

    // Methods finding check & checkmate
    isCheck(kingColor) {
        return this.getKing(kingColor).isAttacked();
    }
    isCheckMate(kingColor) {
    }

    // Method finding a piece on position(x, y)
    getPiece(fieldX, fieldY, color=null) {
        for(let piece of this.pieces) {
            const colorCondition = (color != null) ? (piece.color == color) : true;
            
            if(posEquals(piece, fieldX, fieldY) && colorCondition) {
                return piece;
            }
        }
        return null;
    }
    // Method finding a move of a piece on position(x, y)
    getMove(fieldX, fieldY, piece) {
        for(let move of piece.moves) {
            if(posEquals(move, fieldX, fieldY)) {
                return move;
            }
        }
        return null;
    }
    
    // Method checking if a field on position(x, y) is taken
    isFieldTaken(fieldX, fieldY) {
        return this.getPiece(fieldX, fieldY) ? true : false;
    }
    
    // Method checking if a piece standing on a field can be captured
    isFieldAttacked(fieldX, fieldY, color=null) {
        for(let piece of this.pieces) {
            if(color != null && piece.color != color) continue;

            for(let attackedField of piece.attacked) {
                if(posEquals(attackedField, fieldX, fieldY)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Method getting all pieces of a type
    getPiecesOfType(type, color) {
        let foundPieces = [];
    
        for(let piece of this.pieces) {
            if(piece.type == type && piece.color == color) {
                foundPieces.push(piece);
            }
        }
        return foundPieces;
    }

    // Method getting object of a king of a color
    getKing(color) {
        return this.pieces.find(function(piece) {
            return piece.type == _KING && piece.color == color;
        });
    }
}