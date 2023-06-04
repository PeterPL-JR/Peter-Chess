class Room {
    constructor(gameCode, board) {
        this.gameCode = gameCode;
        this.board = board;
    
        this.players = [];
    }
    joinPlayer(player) {
        this.players.push(player);
    }
}
exports.Room = Room;