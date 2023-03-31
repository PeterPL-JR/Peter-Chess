// Board class
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
    movePiece(x, y, piece, castling, checkSafety=true) {
        if(!posValid(x, y)) {
            return;
        }
        
        let isMoved = piece.move(x, y, castling);
        this.updateMoves(checkSafety);

        if(checkSafety) {
            checkDraw(this, TYPE_LIGHT);
            checkDraw(this, TYPE_DARK);

            checkVictory(this, TYPE_LIGHT);
            checkVictory(this, TYPE_DARK);
        }

        return isMoved;
    }
    updateMoves(checkSafety) {
        for(let piece of this.pieces) {
            piece.getMoves();
        }

        let kingLight = this.getKing(TYPE_LIGHT);
        let kingDark = this.getKing(TYPE_DARK);

        if(kingLight) kingLight.getMoves();
        if(kingDark) kingDark.getMoves();

        if(checkSafety) {
            checkKingSafety(this);
        }
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
        return this.isCheck(kingColor) && countMoves(this, kingColor) == 0;
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

    // Method getting all pieces attacking a king of a color
    getAttackingPieces(color) {
        let attackingPieces = [];
        for(let piece of this.pieces) {
            if(piece.color == color) continue;
            
            for(let attackedField of piece.attacked) {
                let pieceOnPosition = this.getPiece(attackedField.x, attackedField.y);

                if(pieceOnPosition && getType(pieceOnPosition) == "_King" && piece.color != pieceOnPosition.color) {
                    attackingPieces.push(piece);
                    break;
                }
            }
        }
        return attackingPieces;
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

    // Method getting all piece of a color
    getPiecesOfColor(color) {
        let foundPieces = [];
    
        for(let piece of this.pieces) {
            if(piece.color == color) {
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

// Function checking if a king is safe after every move
function checkKingSafety(board) {
    for(let piece of board.pieces) {
        let newMoves = [];

        for(let move of piece.moves) {
            let safe = checkMoveSafety(board, piece, move);
            if(safe) newMoves.push(move);
        }
        piece.moves = newMoves;
    }
}

// Function checking if a move is safe for a king
function checkMoveSafety(board, thisPiece, move) {
    let copiedBoard = copyBoardObject(board);
    let copiedThisPiece = copiedBoard.getPiece(thisPiece.x, thisPiece.y);
    
    // Move piece
    let color = copiedThisPiece.color;
    if(!move.castling) {
        copiedBoard.movePiece(move.x, move.y, copiedThisPiece, false, false);
        let piecesAttackingKing = board.getAttackingPieces(color);

        if(piecesAttackingKing.length == 1 && piecesAttackingKing.indexOf(move.toCapture) != -1) {
            return true;
        }
        return !copiedBoard.isCheck(color);
    }
    return true;
}

// Function copying a border object
function copyBoardObject(board) {
    // Copy board
    let copiedBoard = copyObject(board);

    // Copy pieces
    let copiedPiecesArray = [];
    
    for(let piece of copiedBoard.pieces) {
        let copiedPiece = copyObject(piece);
        copiedPiece.board = null;
        copiedPiecesArray.push(copiedPiece);
    }
    copiedBoard.pieces = [];

    // Join copied board & pieces
    for(let piece of copiedPiecesArray) {
        piece.board = copiedBoard;
        copiedBoard.pieces.push(piece);
    }

    // // Copy moves
    for(let piece of copiedBoard.pieces) {
        let copiedMoves = [];
        for(let move of piece.moves) {
            copiedMoves.push(copyObject(move));
        }
        piece.moves = copiedMoves;
    }
    // Copy pieces to capture of moves
    for(let piece of copiedBoard.pieces) {
        for(let move of piece.moves) {
            if(move.toCapture) {
                let toCapture = copiedBoard.getPiece(move.toCapture.x, move.toCapture.y);
                move.toCapture = toCapture;
            }
        }
    }
    return copiedBoard;
}

// Function counting moves of a player
function countMoves(board, colorIndex) {
    let piecesOfColor = board.getPiecesOfColor(colorIndex);
    let _moves = 0;

    for(let piece of piecesOfColor) {
        _moves += piece.moves.length;
    }
    return _moves;
}

// Function checking if there's draw
function checkDraw(board, playerColor) {
    // There isn't check
    let colorOfOpponent = getOppositeColor(playerColor); // Opponent
    if(board.isCheck(colorOfOpponent)) return; 

    // All pieces arrays of both types
    let opponentPieces = board.getPiecesOfColor(colorOfOpponent); // Opponent pieces
    let thisPieces = board.getPiecesOfColor(playerColor); // This player pieces
    
    let onlyKing = opponentPieces.length == 1; // Opponent has only king
    let onlyKingThis = thisPieces.length == 1; // This player has only king
    
    let onlyTwoThis = thisPieces.length == 2; // This player has only two pieces
    
    let stalemate = countMoves(board, colorOfOpponent) == 0;
    let kingsOnly = onlyKing && onlyKingThis;

    let condition1 = onlyKing && onlyTwoThis && board.getPiecesOfType(_BISHOP, playerColor).length == 1;
    let condition2 = onlyKing && onlyTwoThis && board.getPiecesOfType(_KNIGHT, playerColor).length == 1;

    if(stalemate || kingsOnly || condition1 || condition2) {
        draw();
    }
}

// Function checking if there's victory 
function checkVictory(board, playerColor) {
    let colorOfOpponent = getOppositeColor(playerColor);
    
    if(board.isCheckMate(colorOfOpponent)) {
        victory(playerColor);
    }
}