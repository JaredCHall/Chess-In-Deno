import {Square, SquareName} from "./Square.ts";
import {Piece, PieceType, PromotionType} from "./Piece.ts";
import {Board} from "./Board.ts";
import {CastlingMove, Move} from "./Move.ts";
import {FenNumber} from "../FenNumber.ts";
import {Player, PlayerColor} from "../Player.ts";
import {MoveHandler} from "./MoveHandler.ts";

export class RayDirections {
    static readonly cardinal: number[] = [-10, -1, 1, 10]
    static readonly diagonal: number[] = [9, 11, -9, -11]

    static readonly pieces: Record<PieceType, number[]> = {
        n: [-21, -19,-12, -8, 8, 12, 19, 21],
        r: RayDirections.cardinal,
        b: RayDirections.diagonal,
        q: RayDirections.cardinal.concat(RayDirections.diagonal),
        k: RayDirections.cardinal.concat(RayDirections.diagonal),
        p: []
    }
}

export class MoveGenerator extends MoveHandler{

    readonly config = {
        determineChecks: true,
        determineMates: true,
    }

    static readonly moveDirection = {w: -1, b: 1}

    makeFromCoordinateNotation(userInput: string): Move
    {
        const parts = userInput.match(/^([a-h][1-8])(\s)?([a-h][1-8])(\s)?(=)?([QBNR])?$/)
        if(parts === null){
            throw new Error(`Unreadable Coordinate notation: ${userInput}`)
        }
        const oldSquare = Square.sanitizeName(parts[1])
        const newSquare = Square.sanitizeName(parts[3])
        const promoteType = parts[6] ? Piece.sanitizePromoteType(parts[6]) : null

        const moves = this.getLegalMoves(oldSquare, promoteType).filter((move) => move.newSquare.name === newSquare)
        if(moves.length !== 1){
            throw new Error(`Illegal move: ${userInput}`)
        }
        return moves[0]
    }

    getLegalMoves(squareName: SquareName, promoteType: PromotionType|null = null): Move[] {

        const square = this.getSquare(squareName)

        return this.getPseudoLegalMoves(square, promoteType).filter((move: Move) => {
            const movingColor = move.moving.color
            const enemyColor = Player.oppositeColor(movingColor)

            this.makeMove(move)
            const moveIsLegal = !this.#isKingChecked(movingColor)
            if(moveIsLegal && this.config.determineChecks){
                move.isCheck = this.#isKingChecked(enemyColor)
                if(move.isCheck && this.config.determineMates){
                    move.isMate = !this.hasLegalMoves(enemyColor)
                }
            }
            this.unMakeMove(move)

            return moveIsLegal
        });
    }

    getAllLegalMoves(color: PlayerColor = this.boardState.sideToMove): Move[] {
        let moves: Move[] = []
        this.pieceMap.getPieceList(color).forEach((piece: Piece) => {
            moves = moves.concat(this.getLegalMoves(piece.square))
        })
        return moves
    }

    hasLegalMoves(color: PlayerColor): boolean {
        const pieces = this.pieceMap.getPieceList(color)
        for(const i in pieces){
            if(this.getLegalMoves(pieces[i].square).length > 0){
                return true
            }
        }
        return false
    }

    getPseudoLegalMoves(square: Square, promoteType: PromotionType|null = null): Move[] {
        switch(square.piece?.type){
            case 'p': return this.getPawnMoves(square, square.piece, promoteType)
            case 'r': return this.getRookMoves(square, square.piece)
            case 'n': return this.getKnightMoves(square, square.piece)
            case 'b': return this.getBishopMoves(square, square.piece)
            case 'q': return this.getQueenMoves(square, square.piece)
            case 'k': return this.getKingMoves(square, square.piece)
        }
        return []
    }

    getRookMoves(square: Square, piece: Piece): Move[] {
        return this.#traceRayVectors(square, piece, RayDirections.cardinal, 7)
    }
    getBishopMoves(square: Square, piece: Piece): Move[] {
        return this.#traceRayVectors(square, piece, RayDirections.diagonal, 7)
    }

    getQueenMoves(square: Square, piece: Piece): Move[] {
        return this.#traceRayVectors(square, piece, RayDirections.pieces.q, 7)
    }

    getKnightMoves(square: Square, piece: Piece): Move[] {
        return this.#traceRayVectors(square, piece, RayDirections.pieces.n, 1)
    }

    getKingMoves(square: Square, piece: Piece): Move[] {
        const moves = this.#traceRayVectors(square, piece, RayDirections.pieces.k, 1)
        // add castling moves if possible
        this.boardState.getCastleRightsForColor(piece.color).forEach((right) => {
            const castlingMove = CastlingMove.moves[right]
            if(this.#isCastlesTypeAllowed(castlingMove, piece)) {
                moves.push(new Move(square, this.getSquare(castlingMove.king[1]), piece, null, 'castles'))
            }
        })
        return moves
    }

    getPawnMoves(square: Square, piece: Piece, promoteType: PromotionType|null = null) {
        const moves: Move[] = []
        const direction = MoveGenerator.moveDirection[piece.color]
        // handle single and double space forward moves
        const squareAhead = this.squares10x12[square.index10x12 + 10 * direction]
        if(squareAhead && !squareAhead.piece){
            moves.push(new Move(square, squareAhead, piece, null))
            if(square.isPawnStartSquare(piece.color)){
                const nextSquareAhead = this.squares10x12[squareAhead.index10x12 + 10 * direction]
                if(nextSquareAhead && !nextSquareAhead.piece){
                    moves.push(new Move(square, nextSquareAhead, piece, null, 'double-pawn-move'))
                }
            }
        }
        const captureSquares = [
            this.getSquareByIndex(square.index10x12 + 9 * direction),
            this.getSquareByIndex(square.index10x12 + 11 * direction)
        ]
        captureSquares.forEach((newSquare) => {
            if(!newSquare){return} // square out-of-bounds
            if(newSquare.piece && newSquare.piece.color !== piece.color){
                // normal capture
                moves.push(new Move(square, newSquare, piece, newSquare.piece))
            }else if(newSquare.name === this.boardState.enPassantTarget) {
                // en-passant move
                const captureSquare = this.squares10x12[newSquare.index10x12 - 10 * direction] ?? null
                if(captureSquare?.piece){
                    moves.push(new Move(square, newSquare, piece, captureSquare.piece, 'en-passant'))
                }
            }
        })

        // set promoteType if applicable
        moves.forEach((move: Move) => {
            if(move.newSquare.isPawnPromotionSquare(piece.color)){
                move.promoteType = promoteType ?? 'q'
            }
        })

        return moves
    }

    #isCastlesTypeAllowed(castlingMove: CastlingMove, king: Piece): boolean {
        // king must be on the expected square
        if(king.square !== castlingMove.king[0]){return false}
        // expected rook must be on the expected square
        const rook = this.getPiece(castlingMove.rook[0])
        if(!rook || rook.color !== king.color || rook.type !== 'r'){return false}
        // cannot castle if expected empty squares are occupied
        if(!castlingMove.empty.every((square: SquareName) =>  !this.getPiece(square))){return false}
        // can only castle if all expected safe squares are in fact safe
        return castlingMove.safe.every((squareName: SquareName) => !this.#isSquareThreatenedBy(this.squares[squareName], Player.oppositeColor(king.color)))
    }

    #traceRayVectors(square: Square, piece: Piece, offsets: number[], maxRayLength: number=7): Move[] {
        const moves = []
        for(let i = 0; i<offsets.length;i++) {
            const offset = offsets[i]
            for(let j=1;j<=maxRayLength;j++){
                const newSquare = this.squares10x12[square.index10x12 + j * offset]
                // square out of bounds
                if(!newSquare){break}
                const occupyingPiece = newSquare.piece
                // occupied by a friendly piece
                if(occupyingPiece && occupyingPiece.color === piece.color){break}
                moves.push(new Move(square, newSquare, piece, occupyingPiece))
                // if there's an enemy piece, the ray is terminated
                if(occupyingPiece){break}
            }
        }
        return moves
    }

    #isSquareThreatenedBy(square: Square, enemyColor: PlayerColor): boolean {
        const movingColor = Player.oppositeColor(enemyColor)
        const dummyPiece = new Piece('k',movingColor)

        const hasKnightThreat = !this.getKnightMoves(square, dummyPiece)
            .every((move: Move) => move.captured?.type !== 'n')
        if(hasKnightThreat){return true}

        const hasLateralThreat = !this.getRookMoves(square, dummyPiece)
            .every((move: Move) => {
                if(!move.captured){return true}
                switch(move.captured.type){
                    case 'p': case 'b': case 'n': return true // return in order of likely piece for speed
                    case 'r': case 'q':           return false // rook and queen can capture from this direction
                    case 'k':                     return !move.oldSquare.isAdjacentTo(move.newSquare) // king can capture if adjacent
                }
            })
        if(hasLateralThreat){return true}

        // hasDiagonalThreat
        return !this.getBishopMoves(square, dummyPiece)
            .every((move: Move) => {
                if(!move.captured){return true}
                switch(move.captured.type){
                    case 'p':          {
                        // pawn only threatens from these offsets
                        return ![-9,-11].includes((move.newSquare.index10x12 - move.oldSquare.index10x12) * MoveGenerator.moveDirection[move.captured.color])
                    }
                    case 'r': case 'n': return true // rook and knight are useless on diagonals
                    case 'b': case 'q': return false // bishop and queen can capture from this direction
                    case 'k':           return !move.oldSquare.isAdjacentTo(move.newSquare) // king can capture if adjacent
                }
            })
    }

    #isKingChecked(color: PlayerColor): boolean {
        const squareName = this.pieceMap.getKing(color)?.square
        // @ts-ignore - no validation for sake of speed
        return this.#isSquareThreatenedBy(this.squares[squareName],Player.oppositeColor(color))
    }

}