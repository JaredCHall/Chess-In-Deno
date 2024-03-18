import {Square, SquareName} from "./Square.ts";
import {Piece, PromotionType} from "./Piece.ts";
import {Board} from "./Board.ts";
import {Move, MoveType} from "./Move.ts";
import {CastleRight, FenNumber} from "./FenNumber.ts";
import {Player, PlayerColor} from "./Player.ts";
import {MoveHandler} from "./MoveHandler.ts";
import {CastlesType, CastlingMoves} from "./MoveGen/CastlingMoves.ts";
import {PawnMoves} from "./MoveGen/PawnMoves.ts";

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

    perft(depth: number): number
    {
        let moveCount = 0
        if(depth === 0){
            return 1
        }
        const n_moves = this.getAllLegalMoves()
        n_moves.forEach((move: Move) => {
            this.handler.makeMove(move)
            moveCount += this.perft(depth -1)
            this.handler.unMakeMove(move)
        })

        return moveCount
    }

    getPseudoLegalMoves(square: SquareName, promoteType: PromotionType|null = null): Move[] {
        const piece = this.getPiece(square)
        if(!piece){
            throw new Error(`Cannot get moves. No piece on square: ${square}`)
        }

        switch(piece.type){
            case 'p': return this.getPawnMoves(square, piece, promoteType)
            case 'r': return this.getRookMoves(square, piece)
            case 'n': return this.getKnightMoves(square, piece)
            case 'b': return this.getBishopMoves(square, piece)
            case 'q': return this.getQueenMoves(square, piece)
            case 'k': return this.getKingMoves(square, piece)
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
        const moveOffsets = [-21, -19,-12, -8, 8, 12, 19, 21]
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

    getKingMoves(square: SquareName, piece: Piece): Move[]
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
        const castleRights = this.boardState.getCastleRightsForColor(piece.color)
        // can return early if there are no castling rights or king is not on castling square
        if(castleRights.length === 0) {
            return moves
        }
        castleRights.forEach((right) => {
            const castlesType = CastlingMoves.get(right)
            if(this.#isCastlesTypeAllowed(castlesType, piece)) {
                moves.push(new Move(square, castlesType.kingSquares[1], piece, null, 'castles'))
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
        return castlesType.safeSquares.every((square: SquareName) => !this.#isSquareThreatenedBy(square, Player.oppositeColor(king.color)))
    }

    getPawnMoves(square: SquareName, piece: Piece, promoteType: PromotionType|null = null)
    {

        const enPassantTarget = this.boardState.enPassantTarget

        const moves: Move[] = []
        const offsets = PawnMoves.getOffsets(piece.color)
        const realSquare = this.squares[square]

        // handle single and double space moves
        const moveOffsets = realSquare.isPawnStartSquare(piece.color) ? offsets.single.concat(offsets.double) : offsets.single
        this.#walkOffsets(square, moveOffsets, (newSquare, occupyingPiece, offset) => {
            if(occupyingPiece){
                return false
            }
            const type = offsets.double[0] === offset ? 'double-pawn-move' : 'simple'
            moves.push(new Move(square, newSquare, piece, null, type))
        })
        // handle captures and en-passant
        this.#walkOffsets(square, offsets.capture, (newSquare, occupyingPiece) => {
            if(occupyingPiece && occupyingPiece.color != piece.color){
                // normal capture
                moves.push(new Move(square, newSquare, piece, occupyingPiece))
            }else if(newSquare === enPassantTarget) {
                // en-passant move
                const captureSquare = Square.getSquareBehind(newSquare, piece.color)
                const capturePiece = this.getPiece(captureSquare)
                if(capturePiece){
                    moves.push(new Move(square, newSquare, piece, capturePiece, 'en-passant'))
                }
            }
        })

        // set promoteType if applicable
        moves.forEach((move: Move) => {
            if(this.squares[move.newSquare].isPawnPromotionSquare(piece.color)){
                move.promoteType = promoteType ?? 'q'
            }
        })
        return moves
    }

    #walkOffsets(oldSquare: SquareName, offsets: number[], callback: (newSquare: SquareName, occupyingPiece: Piece|null, offset: number) => boolean|void)
    {
        const oldIndex = MoveFactory.getIndex(oldSquare)
        for(const i in offsets){
            const offset = offsets[i]
            const newIndex  = oldIndex + offset

            if(MoveFactory.isIndexOutOfBounds(newIndex)){
                continue
            }

            const newSquare = MoveFactory.getSquareName(newIndex)
            // callback and break if instructed
            const continueLoop = callback(newSquare, this.getPiece(newSquare), offset)
            if(continueLoop === false){break}
        }
    }

    traceRayVectors(oldSquare: SquareName, piece: Piece, vectors: number[][], maxRayLength: number=7): Move[] {

        const moves = []
        for(let i = 0; i<vectors.length;i++) {
            const vector = vectors[i]

            // the maximum possible moves along a ray from any position is 7, except for the king who can only move 1
            for(let j=1;j<=maxRayLength;j++){
                const newIndex =  MoveFactory.getIndex(oldSquare) + j * (vector[0] + vector[1] * 10)

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



    #isSquareThreatenedBy(square: SquareName, enemyColor: PlayerColor): boolean
    {
        const movingColor = Player.oppositeColor(enemyColor)
        const dummyPiece = new Piece('k',movingColor)
        let isSquareSafe = true

        isSquareSafe = this.getKnightMoves(square, dummyPiece).every((move: Move) => move.captured?.type !== 'n')
        if(!isSquareSafe){return true}

        isSquareSafe = this.getRookMoves(square, dummyPiece).every((move: Move) => {
            switch(move.captured?.type){
                case 'r': case 'q': return false
                case 'k': return !this.squares[move.oldSquare].isAdjacentTo(this.squares[move.newSquare])
            }
            return true
        })
        if(!isSquareSafe){return true}

        isSquareSafe = this.getBishopMoves(square, dummyPiece).every((move: Move) => {
            if(!move.captured){return true}
            if(['r','n'].includes(move.captured.type)){return true}
            if(['b','q'].includes(move.captured.type)){return false}

            const oldSquare = this.squares[move.oldSquare]
            const newSquare = this.squares[move.newSquare]
            const isEnemyPieceAdjacent = oldSquare.isAdjacentTo(newSquare)

            // only king and pawns left. They can only capture if adjacent
            if(!isEnemyPieceAdjacent){return true}
            // only piece type left is the pawn, and
            // it can only capture if the king is in-front of the pawn's square
            return !oldSquare.isAdvancedOf(newSquare, enemyColor)
        })
        return !isSquareSafe
    }

    #isKingChecked(color: PlayerColor): boolean {
        const square = this.pieceMap.getKing(color)?.square
        if(!square){throw new Error(`Expected king on ${square}`)}
        return this.#isSquareThreatenedBy(square,Player.oppositeColor(color))
    }

}