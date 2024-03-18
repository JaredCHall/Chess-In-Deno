import {Square, SquareName} from "./Square.ts";
import {Piece, PromotionType} from "./Piece.ts";
import {Board} from "./Board.ts";
import {Move} from "./Move.ts";
import {FenNumber} from "./FenNumber.ts";
import {Player, PlayerColor} from "./Player.ts";
import {MoveHandler} from "./MoveHandler.ts";
import {CastlesType, CastlingMoves} from "./MoveGen/CastlingMoves.ts";
import {PawnMoves} from "./MoveGen/PawnMoves.ts";

export class MoveFactory extends Board{

    readonly handler: MoveHandler

    readonly config = {
        determineChecks: true,
        determineMates: true,
    }

    constructor(fenString: FenNumber) {

        super(fenString);
        this.handler = new MoveHandler(this)
    }

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

    getLegalMoves(square: SquareName, promoteType: PromotionType|null = null): Move[] {
        return this.getPseudoLegalMoves(square, promoteType).filter((move: Move) => {

            if(move.captured?.type === 'k'){
                console.log(move)
                throw new Error(`Cannot capture a king. Should never happen`)
            }

            const movingColor = move.moving.color
            const enemyColor = Player.oppositeColor(movingColor)

            this.handler.makeMove(move)
            const moveIsLegal = !this.#isKingChecked(movingColor)
            if(moveIsLegal && this.config.determineChecks){
                move.isCheck = this.#isKingChecked(enemyColor)
                if(move.isCheck && this.config.determineMates){
                    move.isMate = !this.hasLegalMoves(enemyColor)
                }
            }
            this.handler.unMakeMove(move)
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

    hasLegalMoves(color: PlayerColor): boolean
    {
        const pieces = this.pieceMap.getPieceList(color)
        for(const i in pieces){
            const piece = pieces[i]
            if(this.getLegalMoves(piece.square).length > 0){
                return true
            }
        }
        return false
    }

    getPseudoLegalMoves(squareName: SquareName, promoteType: PromotionType|null = null): Move[] {
        const piece = this.getPiece(squareName)
        if(!piece){
            throw new Error(`Cannot get moves. No piece on square: ${squareName}`)
        }
        const square = this.squares[squareName]

        switch(piece.type){
            case 'p': return this.getPawnMoves(square, piece, promoteType)
            case 'r': return this.getRookMoves(square, piece)
            case 'n': return this.getKnightMoves(square, piece)
            case 'b': return this.getBishopMoves(square, piece)
            case 'q': return this.getQueenMoves(square, piece)
            case 'k': return this.getKingMoves(square, piece)
        }
    }

    getRookMoves(square: Square, piece: Piece): Move[]
    {
        return this.traceRayVectors(square, piece, [
            [0,-1], // N
            [1,0],  // E
            [0,1],  // S
            [-1,0], // W
        ], 7)
    }
    getBishopMoves(square: Square, piece: Piece): Move[]
    {
        return this.traceRayVectors(square, piece, [
            [1,-1],  // NE
            [1,1],   // SE
            [-1,1],  // SW
            [-1,-1], // NW
        ], 7)
    }

    getQueenMoves(square: Square, piece: Piece): Move[]
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
        ], 7)
    }

    getKnightMoves(square: Square, piece: Piece): Move[]
    {

        const moves: Move[] = []
        const moveOffsets = [-21, -19,-12, -8, 8, 12, 19, 21]

        this.#walkOffsets(square, moveOffsets, (newSquare,occupyingPiece) => {
            if(!occupyingPiece || occupyingPiece.color !== piece.color){
                moves.push(new Move(square, newSquare, piece, occupyingPiece))
            }
        })
        return moves
    }

    getKingMoves(square: Square, piece: Piece): Move[]
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

        // evaluate potential castling moves
        this.boardState.getCastleRightsForColor(piece.color).forEach((right) => {
            const castlesType = CastlingMoves.get(right)
            if(this.#isCastlesTypeAllowed(castlesType, piece)) {
                moves.push(new Move(square, this.getSquare(castlesType.kingSquares[1]), piece, null, 'castles'))
            }
        })
        return moves
    }

    #isCastlesTypeAllowed(castlesType: CastlesType, king: Piece): boolean
    {
        // king must be on the expected square
        if(king.square !== castlesType.kingSquares[0]){
            return false
        }
        // expected rook must be on the expected square
        const rook = this.getPiece(castlesType.rookSquares[0])
        if(!rook || rook.color !== king.color || rook.type !== 'r'){
            return false
        }
        // cannot castle if expected empty squares are occupied
        if(!castlesType.emptySquares.every((square: SquareName) =>  !this.getPiece(square))){
            return false
        }
        // can only castle if all expected safe squares are in fact safe
        return castlesType.safeSquares.every((squareName: SquareName) => !this.#isSquareThreatenedBy(this.squares[squareName], Player.oppositeColor(king.color)))
    }

    getPawnMoves(square: Square, piece: Piece, promoteType: PromotionType|null = null)
    {

        const moves: Move[] = []
        const offsets = PawnMoves.getOffsets(piece.color)

        // handle single space moves
        let immediateSquareIsOccupied = false
        this.#walkOffsets(square, offsets.single, (newSquare, occupyingPiece) => {
            if(!occupyingPiece){
                moves.push(new Move(square, newSquare, piece, null))
            }
            immediateSquareIsOccupied = occupyingPiece !== null
        })
        // only check double pawn moves if single space move is possible
        if(!immediateSquareIsOccupied && square.isPawnStartSquare(piece.color)){
            this.#walkOffsets(square, offsets.double, (newSquare, occupyingPiece) => {
                if(!occupyingPiece) {
                    moves.push(new Move(square, newSquare, piece, null, 'double-pawn-move'))
                }
            })
        }

        // handle captures and en-passant
        this.#walkOffsets(square, offsets.capture, (newSquare, occupyingPiece) => {
            if(occupyingPiece && occupyingPiece.color != piece.color){
                // normal capture
                moves.push(new Move(square, newSquare, piece, occupyingPiece))
            }else if(newSquare.name === this.boardState.enPassantTarget) {
                // en-passant move
                const captureSquare = Square.getSquareBehind(newSquare.name, piece.color)
                const capturePiece = this.getPiece(captureSquare)
                if(capturePiece){
                    moves.push(new Move(square, newSquare, piece, capturePiece, 'en-passant'))
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

    #walkOffsets(square: Square, offsets: number[], callback: (newSquare: Square, occupyingPiece: Piece|null, offset: number) => void)
    {
        for(const i in offsets){
            const offset = offsets[i]
            const newIndex  = square.index10x12 + offset
            const newSquare = this.squares10x12[newIndex]
            if(newSquare){
                callback(newSquare, newSquare.piece, offset)
            }
        }
    }

    traceRayVectors(square: Square, piece: Piece, vectors: number[][], maxRayLength: number=7): Move[] {

        const moves = []
        for(let i = 0; i<vectors.length;i++) {
            const vector = vectors[i]

            // the maximum possible moves along a ray from any position is 7, except for the king who can only move 1
            for(let j=1;j<=maxRayLength;j++){
                const newIndex =  square.index10x12 + j * (vector[0] + vector[1] * 10)
                const newSquare = this.squares10x12[newIndex]
                if(!newSquare){
                    // square out of bounds
                    break
                }
                const occupyingPiece = newSquare.piece
                // occupied by a friendly piece
                if(occupyingPiece && occupyingPiece.color === piece.color){
                    break
                }
                moves.push(new Move(square, newSquare, piece, occupyingPiece))
                // if there's an enemy piece, the ray is terminated
                if(occupyingPiece){
                    break
                }
            }
        }
        return moves
    }

    #isSquareThreatenedBy(square: Square, enemyColor: PlayerColor): boolean
    {
        const movingColor = Player.oppositeColor(enemyColor)
        const dummyPiece = new Piece('k',movingColor)
        let isSquareSafe = true

        isSquareSafe = this.getKnightMoves(square, dummyPiece).every((move: Move) => move.captured?.type !== 'n')
        if(!isSquareSafe){return true}

        isSquareSafe = this.getRookMoves(square, dummyPiece).every((move: Move) => {
            switch(move.captured?.type){
                case 'r': case 'q': return false
                case 'k': return !move.oldSquare.isAdjacentTo(move.newSquare)
            }
            return true
        })
        if(!isSquareSafe){return true}

        isSquareSafe = this.getBishopMoves(square, dummyPiece).every((move: Move) => {
            if(!move.captured){return true}
            if(['r','n'].includes(move.captured.type)){return true}
            if(['b','q'].includes(move.captured.type)){return false}

            const isEnemyPieceAdjacent = move.oldSquare.isAdjacentTo(move.newSquare)

            // only king and pawns left. They can only capture if adjacent
            if(!isEnemyPieceAdjacent){return true}
            // only piece type left is the pawn, and
            // it can only capture if the king is in front of the pawn's square
            return !move.oldSquare.isAdvancedOf(move.newSquare, enemyColor)
        })
        return !isSquareSafe
    }

    #isKingChecked(color: PlayerColor): boolean {
        const squareName = this.pieceMap.getKing(color)?.square
        if(!squareName){throw new Error(`Expected king on ${squareName}`)}
        return this.#isSquareThreatenedBy(this.squares[squareName],Player.oppositeColor(color))
    }

}