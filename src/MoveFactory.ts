import {SquareName} from "./Square.ts";
import {Piece} from "./Piece.ts";
import {Board} from "./Board.ts";
import {Move} from "./Move.ts";
import {CastleRight, FenNumber} from "./FenNumber.ts";
import {PlayerColor} from "./Player.ts";

export class MoveFactory extends Board{

    static readonly boardBoundary: (0|1)[] = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 8
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 7
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 6
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 5
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 4
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 3
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 2
        0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, // rank 1
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]

    static squaresByIndex: Record<number, SquareName> = {
        26: 'a8', 27: 'b8', 28: 'c8', 29: 'd8', 30: 'e8', 31: 'f8', 32: 'g8', 33: 'h8', // rank 8
        38: 'a7', 39: 'b7', 40: 'c7', 41: 'd7', 42: 'e7', 43: 'f7', 44: 'g7', 45: 'h7', // rank 7
        50: 'a6', 51: 'b6', 52: 'c6', 53: 'd6', 54: 'e6', 55: 'f6', 56: 'g6', 57: 'h6', // rank 6
        62: 'a5', 63: 'b5', 64: 'c5', 65: 'd5', 66: 'e5', 67: 'f5', 68: 'g5', 69: 'h5', // rank 5
        74: 'a4', 75: 'b4', 76: 'c4', 77: 'd4', 78: 'e4', 79: 'f4', 80: 'g4', 81: 'h4', // rank 4
        86: 'a3', 87: 'b3', 88: 'c3', 89: 'd3', 90: 'e3', 91: 'f3', 92: 'g3', 93: 'h3', // rank 3
        98: 'a2', 99: 'b2', 100: 'c2', 101: 'd2', 102: 'e2', 103: 'f2', 104: 'g2', 105: 'h2', // rank 2
        110: 'a1', 111: 'b1', 112: 'c1', 113: 'd1', 114: 'e1', 115: 'f1', 116: 'g1', 117: 'h1', // rank 1
    }

    static indexesBySquare: Record<SquareName, number> // flipped version of squaresByIndex
    static {
        // @ts-ignore - flipped keys are correct
        MoveFactory.indexesBySquare = Object.fromEntries(Object.entries(this.squaresByIndex).map(([key, value]) => [value, parseInt(key)]))
    }

    static isIndexOutOfBounds(index: number): boolean {
        return MoveFactory.boardBoundary[index] === 0
    }

    static getIndex(name: SquareName): number {
        return MoveFactory.indexesBySquare[name]
    }

    static getSquareName(index: number): SquareName {
        return MoveFactory.squaresByIndex[index]
    }


    getPseudoLegalMoves(square: SquareName, fenNumber: FenNumber): Move[] {

        const piece = this.getPiece(square)
        if(!piece){
            throw new Error(`Cannot get moves. No piece on square: ${square}`)
        }

        switch(piece.type){
            case 'p': return this.getPawnMoves(square, piece, fenNumber.enPassantTarget)
            case 'r': return this.getRookMoves(square, piece)
            case 'n': return this.getKnightMoves(square, piece)
            case 'b': return this.getBishopMoves(square, piece)
            case 'q': return this.getQueenMoves(square, piece)
            case 'k': return this.getKingMoves(square, piece, fenNumber.castleRights)
        }
    }

    getRookMoves(square: SquareName, piece: Piece): Move[]
    {
        return this.traceRayVectors(square, piece, [
            [0,-1], // N
            [1,0],  // E
            [0,1],  // S
            [-1,0], // W
        ])
    }

    getBishopMoves(square: SquareName, piece: Piece): Move[]
    {
        return this.traceRayVectors(square, piece, [
            [1,-1],  // NE
            [1,1],   // SE
            [-1,1],  // SW
            [-1,-1], // NW
        ])
    }

    getQueenMoves(square: SquareName, piece: Piece): Move[]
    {
        return this.traceRayVectors(square, piece, [
            [0,-1],  // N
            [1,-1],  // NE
            [1,0],   // E
            [1,1],   // SE
            [0,1],   // S
            [-1,1],  // SW
            [-1,0],  // W
            [-1,-1], // NW
        ])
    }

    getKnightMoves(square: SquareName, piece: Piece): Move[]
    {
        const moves = []
        const moveOffsets = [
            -23, // NNE
            -10, // ENE
            14,  // ESE
            25,  // SSE
            23,  // SSW
            10,  // WSW
            -14, // WNW
            -25  // NNW
        ]
        for(let i = 0; i<moveOffsets.length;i++){
            const offset = moveOffsets[i]
            const newIndex = MoveFactory.getIndex(square) + offset

            if(MoveFactory.isIndexOutOfBounds(newIndex)){
                continue
            }

            const newSquare = MoveFactory.getSquareName(newIndex)
            const occupyingPiece = this.getPiece(newSquare)

            // occupied by a friendly piece
            if(occupyingPiece && occupyingPiece.color === piece.color){
                continue
            }

            moves.push(new Move(square, newSquare, piece, occupyingPiece))
        }

        return moves
    }

    getKingMoves(square: SquareName, piece: Piece, castleRights: CastleRight[]): Move[]
    {
        const moves = this.traceRayVectors(square, piece, [
            [0,-1],  // N
            [1,-1],  // NE
            [1,0],   // E
            [1,1],   // SE
            [0,1],   // S
            [-1,1],  // SW
            [-1,0],  // W
            [-1,-1], // NW
        ], 1)

        // no castle rights, this is a full list of moves
        if(castleRights.length === 0){
            return moves
        }

        const areSquaresEmpty = (squares: SquareName[]): boolean => {
            return squares.every((square: SquareName) =>  !this.getPiece(square))
        }
        const isRookOnRequiredSquare = (square: SquareName, color: PlayerColor): boolean => {
            const piece = this.getPiece(square)
            return piece?.type === 'r' && piece?.color === color
        }

        // evaluate possible castling moves
        if(piece.color === 'w' && square === 'e1'){
            if(castleRights.indexOf('K') !== -1 && isRookOnRequiredSquare('h1', 'w') && areSquaresEmpty(['f1','g1'])){
                moves.push(new Move('e1','g1',piece,null,'castles'))
            }
            if(castleRights.indexOf('Q') !== -1 && isRookOnRequiredSquare('a1', 'w') && areSquaresEmpty(['b1','c1','d1'])){
                moves.push(new Move('e1','c1',piece,null,'castles'))
            }
        }else if(piece.color === 'b' && square === 'e8'){
            if(castleRights.indexOf('k') !== -1 && isRookOnRequiredSquare('h8', 'b') && areSquaresEmpty(['f8','g8'])){
                moves.push(new Move('e8','g8',piece,null,'castles'))
            }
            if(castleRights.indexOf('q') !== -1 && isRookOnRequiredSquare('a8', 'b') && areSquaresEmpty(['b8','c8','d8'])){
                moves.push(new Move('e8','c8',piece,null,'castles'))
            }
        }

        return moves
    }

    getPawnMoves(square: SquareName, piece: Piece, enPassantTarget: null|SquareName)
    {
        const moves = []
        const isPieceWhite = piece.color == 'w'

        const moveOffsets = isPieceWhite ? [-12] : [12] // N or S
        const captureOffsets = isPieceWhite ? [-11, -13] : [11,13] // NE,NW or SW,SE

        // determine if pawn is on starting square
        const startingRank = this.squares[square].rank
        const isOnStartingRank = (isPieceWhite && startingRank == 2) || (!isPieceWhite && startingRank == 7)
        if(isOnStartingRank){
            moveOffsets.push(isPieceWhite ? -24 : 24) // N or S
        }

        // test if pawn can move forward
        for(const i in moveOffsets){
            const offset = moveOffsets[i]
            const newIndex = MoveFactory.getIndex(square) + offset
            if(MoveFactory.isIndexOutOfBounds(newIndex)){
                break
            }
            const newSquare = MoveFactory.getSquareName(newIndex)
            const occupyingPiece = this.getPiece(newSquare)
            if(occupyingPiece){
                break
            }
            moves.push(new Move(square, newSquare, piece, null, Math.abs(offset) === 24 ? 'double-pawn-move' : 'simple'))
        }

        // test if pawn can capture diagonally
        for(const i in captureOffsets){
            const offset = captureOffsets[i]
            const newIndex = MoveFactory.getIndex(square) + offset
            if(MoveFactory.isIndexOutOfBounds(newIndex)){
                break
            }
            const newSquare = MoveFactory.getSquareName(newIndex)
            const occupyingPiece = this.getPiece(newSquare)

            if(occupyingPiece){
                moves.push(new Move(square, newSquare, piece, occupyingPiece, 'simple'))
            }else if(newSquare === enPassantTarget) {
                moves.push(new Move(square, newSquare, piece, this.getPiece(enPassantTarget), 'en-passant'))
            }
        }

        // test if pawn can promote
        moves.map((move: Move): Move => {
            const newSquareRank = this.squares[move.newSquare].rank
            if((move.moving.color === 'w' && newSquareRank === 8) || (move.moving.color === 'b' && newSquareRank === 1)){
                return new Move(move.oldSquare, move.newSquare, move.moving, move.captured,'pawn-promotion','q')
            }
            return move
        })
        return moves
    }

    traceRayVectors(oldSquare: SquareName, piece: Piece, vectors: number[][], maxRayLength: number=7): Move[] {

        const moves = []
        for(let i = 0; i<vectors.length;i++) {
            const vector = vectors[i]

            // the maximum possible moves along a ray from any position is 7, except for the king who can only move 1
            for(let j=1;j<=maxRayLength;j++){
                const newIndex =  MoveFactory.getIndex(oldSquare) + j * (vector[0] + vector[1] * 12)

                if(MoveFactory.isIndexOutOfBounds(newIndex)){
                    break
                }

                const newSquare = MoveFactory.getSquareName(newIndex)
                const occupyingPiece = this.getPiece(newSquare)

                // occupied by a friendly piece
                if(occupyingPiece && occupyingPiece.color === piece.color){
                    break
                }
                moves.push(new Move(oldSquare, newSquare, piece, occupyingPiece))

                // if there's an enemy piece, the ray is terminated
                if(occupyingPiece){
                    break
                }
            }
        }
        return moves
    }
}