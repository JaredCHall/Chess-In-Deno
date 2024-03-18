import {Square, SquareName} from "./Square.ts";
import {Piece, PromotionType} from "./Piece.ts";
import {Board} from "./Board.ts";
import {Move} from "./Move.ts";
import {FenNumber} from "./FenNumber.ts";
import {Player, PlayerColor} from "./Player.ts";
import {MoveHandler} from "./MoveHandler.ts";
import {CastlesType, CastlingMoves} from "./MoveGen/CastlingMoves.ts";


export class MoveFactory extends Board{

    // 10 x 12 https://www.chessprogramming.org/10x12_Board
    static readonly boardBoundary: (0|1)[] = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 8
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 7
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 6
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 5
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 4
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 3
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 2
        0, 1, 1, 1, 1, 1, 1, 1, 1, 0, // rank 1
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]

    static squaresByIndex: Record<number, SquareName> = {
        21: 'a8', 22: 'b8', 23: 'c8', 24: 'd8', 25: 'e8', 26: 'f8', 27: 'g8', 28: 'h8', // rank 8
        31: 'a7', 32: 'b7', 33: 'c7', 34: 'd7', 35: 'e7', 36: 'f7', 37: 'g7', 38: 'h7', // rank 7
        41: 'a6', 42: 'b6', 43: 'c6', 44: 'd6', 45: 'e6', 46: 'f6', 47: 'g6', 48: 'h6', // rank 6
        51: 'a5', 52: 'b5', 53: 'c5', 54: 'd5', 55: 'e5', 56: 'f5', 57: 'g5', 58: 'h5', // rank 5
        61: 'a4', 62: 'b4', 63: 'c4', 64: 'd4', 65: 'e4', 66: 'f4', 67: 'g4', 68: 'h4', // rank 4
        71: 'a3', 72: 'b3', 73: 'c3', 74: 'd3', 75: 'e3', 76: 'f3', 77: 'g3', 78: 'h3', // rank 3
        81: 'a2', 82: 'b2', 83: 'c2', 84: 'd2', 85: 'e2', 86: 'f2', 87: 'g2', 88: 'h2', // rank 2
        91: 'a1', 92: 'b1', 93: 'c1', 94: 'd1', 95: 'e1', 96: 'f1', 97: 'g1', 98: 'h1', // rank 1
    }

    static indexesBySquare: Record<SquareName, number> // flipped version of squaresByIndex
    static {
        // @ts-ignore - flipped keys are correct
        MoveFactory.indexesBySquare = Object.fromEntries(Object.entries(this.squaresByIndex).map(([key, value]) => [value, parseInt(key)]))
    }

    static knightMoveOffsets = [-21, -19,-12, -8, 8, 12, 19, 21]
    static bishopMoveOffsets = [-11,  -9,  9, 11]
    static rookMoveOffsets = [ -10,  -1,  1, 10]
    static queenMoveOffsets = MoveFactory.rookMoveOffsets.concat(MoveFactory.bishopMoveOffsets)
    static kingMoveOffsets = MoveFactory.queenMoveOffsets

    static pawnMoveOffsets ={
        w: {single: [-10], double: [-20], capture: [-9, -11]}, // white pawns
        b: {single: [10], double: [20], capture: [9, 11]} // black pawns
    }
    static pieceMoveOffsets = {
        r: this.rookMoveOffsets,
        q: this.queenMoveOffsets,
        n: this.knightMoveOffsets,
        k: this.kingMoveOffsets,
        b: this.bishopMoveOffsets,
    }
    static pieceMaxMovementDistance = {r: 7, q: 7, n: 1, k: 1, b: 7,}

        static isIndexOutOfBounds(index: number): boolean {
        return MoveFactory.boardBoundary[index] === 0
    }

    static getIndex(name: SquareName): number {
        return MoveFactory.indexesBySquare[name]
    }

    static getSquareName(index: number): SquareName {
        return MoveFactory.squaresByIndex[index]
    }

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

        const moves = this.getLegalMoves(oldSquare, promoteType).filter((move) => move.newSquare === newSquare)
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
                    move.isMate = this.getAllLegalMoves(enemyColor).length === 0
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

    getPseudoLegalMoves(originSquare: SquareName, promoteType: PromotionType|null = null): Move[] {

        const square = this.squares[originSquare]
        const piece = square.piece ?? null
        if(!piece){
            throw new Error(`Cannot get moves. No piece on square: ${originSquare}`)
        }
        const moves: Move[] = []
        if(piece.type != 'p'){
            // non-pawn moves
            this.#walkOffsetsByPieceType(square, piece.color, piece.type, (newSquare, capturedPiece) => {
                moves.push(new Move(originSquare, newSquare.name, piece, capturedPiece))
            })
            // handle castling moves
            if(piece.type === 'k'){
                this.boardState.getCastleRightsForColor(piece.color).forEach((right) => {
                    const castlesType = CastlingMoves.get(right)
                    if(this.#isCastlesTypeAllowed(castlesType, piece)) {
                        moves.push(new Move(square.name, castlesType.kingSquares[1], piece, null, 'castles'))
                    }
                })
            }
        }else{
            // Pawn moves
            const offsets = MoveFactory.pawnMoveOffsets[piece.color]
            const moveOffsets = square.isPawnStartSquare(piece.color) ? offsets.single.concat(offsets.double) : offsets.single
            this.#walkPawnOffsets(square, moveOffsets, (newSquare, occupyingPiece, offset) => {
                // single and double space moves
                if(occupyingPiece){return false}
                const type = offsets.double[0] === offset ? 'double-pawn-move' : 'simple'
                moves.push(new Move(square.name, newSquare.name, piece, null, type))
            })
            // handle captures and en-passant
            this.#walkPawnOffsets(square, offsets.capture, (newSquare, occupyingPiece) => {
                if(occupyingPiece && occupyingPiece.color != piece.color){
                    // normal capture
                    moves.push(new Move(square.name, newSquare.name, piece, occupyingPiece))
                }else if(newSquare.name === this.boardState.enPassantTarget) {
                    // en-passant move
                    const captureSquare = Square.getSquareBehind(newSquare.name, piece.color)
                    const capturePiece = this.getPiece(captureSquare)
                    if(capturePiece){moves.push(new Move(square.name, newSquare.name, piece, capturePiece, 'en-passant'))}
                }
            })
            // set promoteType if applicable
            moves.forEach((move: Move) => {
                if(this.squares[move.newSquare].isPawnPromotionSquare(piece.color)){
                    move.promoteType = promoteType ?? 'q'
                }
            })
        }

        return moves
    }

    #walkPawnOffsets(square: Square, offsets: number[], callback: (square: Square, occupyingPiece: Piece|null, offset: number) => boolean|void)
    {
        const oldIndex = MoveFactory.getIndex(square.name)
        for(const i in offsets){
            const offset = offsets[i]
            const newIndex  = oldIndex + offset
            // keep checking offsets even if OOB
            if(MoveFactory.isIndexOutOfBounds(newIndex)){
                continue
            }
            const newSquare = this.squares[MoveFactory.getSquareName(newIndex)]
            // callback and break if instructed
            const continueLoop = callback(newSquare, newSquare.piece, offset)
            if(continueLoop === false){break}
        }
    }


    #walkRayOffsets(square: Square, movingColor: PlayerColor, offsets: number[], maxLen: number, callback: (newSquare: Square, capturedPiece: Piece|null) => void|false)
    {
        const oldIndex = MoveFactory.getIndex(square.name)
        // each offset is a ray direction
        for(const i in offsets){
            const offset = offsets[i]
            // in each direction, we walk the max length of the ray
            for(let j = 1; j <= maxLen; j++){
                const newIndex = oldIndex + offset * j
                if(MoveFactory.isIndexOutOfBounds(newIndex)){
                    break
                }
                const newSquare = this.squares[MoveFactory.getSquareName(newIndex)]
                const capturedPiece = newSquare.piece

                if(capturedPiece){
                    if(capturedPiece.color === movingColor){
                        break
                    }else{
                        if(callback(newSquare,capturedPiece) === false){
                            return
                        }
                        break
                    }
                }
                if(callback(newSquare,null) === false){
                    return
                }
            }
        }
    }

    #walkOffsetsByPieceType(square: Square, movingColor: PlayerColor, pieceType: 'k'|'q'|'r'|'b'|'n', callback: (newSquare: Square, capturedPiece: Piece|null) => void)
    {
        const offsets = MoveFactory.pieceMoveOffsets[pieceType]
        const maxLen = MoveFactory.pieceMaxMovementDistance[pieceType]
        this.#walkRayOffsets(square, movingColor, offsets, maxLen, callback)
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
        return castlesType.safeSquares.every((square: SquareName) => !this.#isSquareThreatenedBy(this.squares[square], Player.oppositeColor(king.color)))
    }


    #isSquareThreatenedBy(square: Square, enemyColor: PlayerColor): boolean
    {
        const movingColor = Player.oppositeColor(enemyColor)
        let isSquareSafe = true

        // check if a knight can capture
        this.#walkOffsetsByPieceType(square, movingColor, 'n', (_square,captured) => {
            if(captured && captured.type === 'n'){return isSquareSafe = false}
        })
        if(!isSquareSafe){return true}
        // check if rook, queen or king can capture along ranks or files
        this.#walkOffsetsByPieceType(square, movingColor, 'r', (newSquare,captured) => {
            if(!captured){return}
            // not safe if there's a rook or queen
            if(captured.type === 'r' || captured.type === 'q'){return isSquareSafe = false}
            // not safe if there's a king and the square is adjacent
            if(captured.type === 'k' && square.isAdjacentTo(newSquare)){return isSquareSafe = false}
        })
        if(!isSquareSafe){return true}
        // check if bishop, queen, king or pawn can capture diagonally
        this.#walkOffsetsByPieceType(square, movingColor, 'b', (newSquare,captured) => {
            if(!captured){return}
            // not safe if there's a bishop or queen
            if(captured.type === 'b' || captured.type === 'q'){return isSquareSafe = false}
            // not safe if there's a king and the square is adjacent
            if(captured.type === 'k' && square.isAdjacentTo(newSquare)){return isSquareSafe = false}
            // not safe if there's a pawn looking to capture the adjacent square
            if(captured.type === 'p' && square.isAdjacentTo(newSquare) && square.isAdvancedOf(newSquare, enemyColor)){return isSquareSafe = false}
        })

        return !isSquareSafe
    }

    #isKingChecked(color: PlayerColor): boolean {
        const squareName = this.pieceMap.getKing(color)?.square
        if(!squareName){throw new Error(`Expected king on ${squareName}`)}
        return this.#isSquareThreatenedBy(this.squares[squareName],Player.oppositeColor(color))
    }

}