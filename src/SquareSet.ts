import {Square, SquareFile, SquareName, SquareRank} from "./Square.ts";
import {FenNumber} from "./FenNumber.ts";
import {Piece, PromotionType} from "./Piece.ts";
import {PieceSet} from "./PieceSet.ts";
import { Move, MoveType } from "./Move.ts";

export class SquareSet
{

    readonly a8 = new Square('a', 8, 'light')
    readonly b8 = new Square('b', 8, 'dark')
    readonly c8 = new Square('c', 8, 'light')
    readonly d8 = new Square('d', 8, 'dark')
    readonly e8 = new Square('e', 8, 'light')
    readonly f8 = new Square('f', 8, 'dark')
    readonly g8 = new Square('g', 8, 'light')
    readonly h8 = new Square('h', 8, 'dark')

    readonly a7 = new Square('a', 7, 'dark')
    readonly b7 = new Square('b', 7, 'light')
    readonly c7 = new Square('c', 7, 'dark')
    readonly d7 = new Square('d', 7, 'light')
    readonly e7 = new Square('e', 7, 'dark')
    readonly f7 = new Square('f', 7, 'light')
    readonly g7 = new Square('g', 7, 'dark')
    readonly h7 = new Square('h', 7, 'light')

    readonly a6 = new Square('a', 6, 'light')
    readonly b6 = new Square('b', 6, 'dark')
    readonly c6 = new Square('c', 6, 'light')
    readonly d6 = new Square('d', 6, 'dark')
    readonly e6 = new Square('e', 6, 'light')
    readonly f6 = new Square('f', 6, 'dark')
    readonly g6 = new Square('g', 6, 'light')
    readonly h6 = new Square('h', 6, 'dark')

    readonly a5 = new Square('a', 5, 'dark')
    readonly b5 = new Square('b', 5, 'light')
    readonly c5 = new Square('c', 5, 'dark')
    readonly d5 = new Square('d', 5, 'light')
    readonly e5 = new Square('e', 5, 'dark')
    readonly f5 = new Square('f', 5, 'light')
    readonly g5 = new Square('g', 5, 'dark')
    readonly h5 = new Square('h', 5, 'light')

    readonly a4 = new Square('a', 4, 'light')
    readonly b4 = new Square('b', 4, 'dark')
    readonly c4 = new Square('c', 4, 'light')
    readonly d4 = new Square('d', 4, 'dark')
    readonly e4 = new Square('e', 4, 'light')
    readonly f4 = new Square('f', 4, 'dark')
    readonly g4 = new Square('g', 4, 'light')
    readonly h4 = new Square('h', 4, 'dark')

    readonly a3 = new Square('a', 3, 'dark')
    readonly b3 = new Square('b', 3, 'light')
    readonly c3 = new Square('c', 3, 'dark')
    readonly d3 = new Square('d', 3, 'light')
    readonly e3 = new Square('e', 3, 'dark')
    readonly f3 = new Square('f', 3, 'light')
    readonly g3 = new Square('g', 3, 'dark')
    readonly h3 = new Square('h', 3, 'light')

    readonly a2 = new Square('a', 2, 'light')
    readonly b2 = new Square('b', 2, 'dark')
    readonly c2 = new Square('c', 2, 'light')
    readonly d2 = new Square('d', 2, 'dark')
    readonly e2 = new Square('e', 2, 'light')
    readonly f2 = new Square('f', 2, 'dark')
    readonly g2 = new Square('g', 2, 'light')
    readonly h2 = new Square('h', 2, 'dark')

    readonly a1 = new Square('a', 1, 'dark')
    readonly b1 = new Square('b', 1, 'light')
    readonly c1 = new Square('c', 1, 'dark')
    readonly d1 = new Square('d', 1, 'light')
    readonly e1 = new Square('e', 1, 'dark')
    readonly f1 = new Square('f', 1, 'light')
    readonly g1 = new Square('g', 1, 'dark')
    readonly h1 = new Square('h', 1, 'light')

    readonly pieceSet = new PieceSet()

    constructor(fenNumber: FenNumber|string = '8/8/8/8/8/8/8/8') {
        this.setFromFen(new FenNumber(fenNumber))
    }

    promotePiece(piece: Piece, promoteType: PromotionType)
    {
        this.pieceSet.promotePiece(piece, promoteType)
    }

    #getEnPassantMove(oldSquare: SquareName, newSquare: SquareName): Move
    {
        const capturedSquare = newSquare.charAt(0) + oldSquare.charAt(1)

        // @ts-ignore - it will always be valid
        const capturedPiece = this.getPiece(capturedSquare)

        return new Move(
            oldSquare,
            newSquare,
            this.getPiece(oldSquare),
            capturedPiece,
            'en-passant',
        )
    }

    getMove(oldSquare: SquareName, newSquare: SquareName, moveType: MoveType = 'simple', promotionType: 'q'|'r'|'b'|'n'|null = null): Move
    {
        if(moveType === 'en-passant'){
            return this.#getEnPassantMove(oldSquare, newSquare)
        }

        return new Move(
            oldSquare,
            newSquare,
            this.getPiece(oldSquare),
            this.hasPiece(newSquare) ? this.getPiece(newSquare) : null,
            moveType,
            promotionType
        )
    }

    makeMove(move: Move)
    {
        move.movePieces(this)
    }

    getSquare(name: SquareName): Square
    {
        return this[name]
    }

    setStartingSquare(squareName: SquareName, piece: Piece|null)
    {
        this[squareName].setPiece(piece)
        if(piece){
            this.pieceSet.addPiece(piece)
        }
    }

    getPieceList(color: 'w'|'b'|null = null, types: string[] = Piece.TYPES): Piece[]
    {
        return this.pieceSet.getPieces(color, types)
    }

    getPiece(squareName: SquareName): Piece
    {
        const piece = this[squareName].piece
        if(!piece){
            throw new Error(`Could not get piece. There is no piece on square: ${squareName}.`)
        }
        return piece
    }

    hasPiece(squareName: SquareName): boolean
    {
        return this[squareName].piece !== null
    }

    setSquare(squareName: SquareName, piece: Piece|null, isCapture: boolean = false)
    {
        const oldPiece = this[squareName].hasPiece() ? this[squareName].piece : null
        this[squareName].setPiece(piece)
        if(piece){
            piece.square = squareName
        }

        if(isCapture){
            if(!oldPiece){
                throw new Error(`setSquare(${squareName},${piece?.serialize()},true) called with isCapture=true, but captured square does not have a piece.`)
            }
            this.pieceSet.removeCapturedPiece(oldPiece)
        }
    }


    setFromFen(fenNumber: FenNumber)
    {
        this.pieceSet.flush()

        const rows = fenNumber.piecePlacements.split('/').reverse()
        if (rows.length !== 8) {
            throw new Error('FEN piece placement must include all eight rows')
        }

        const columnNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

        const getSquareName = (columnNumber: number, row: number): SquareName => {
            const colName  = columnNames[columnNumber - 1]
            // @ts-ignore colName is always valid
            return Square.getSquareName(colName, row)
        }

        for (let rowNumber = 8; rowNumber > 0; rowNumber--) {
            const chars = rows[rowNumber - 1].split('')
            let columnNumber = 1;
            for (let i = 0; i < chars.length; i++) {
                const character = chars[i]
                if (/[1-8]/.test(character)) {
                    const emptySpaces = parseInt(character)
                    const lastEmptySpace = columnNumber + emptySpaces - 1
                    while (columnNumber <= lastEmptySpace) {
                        // set empty squares
                        this.setStartingSquare(getSquareName(columnNumber, rowNumber), null)
                        columnNumber++
                    }
                } else if (/[rbnqkpRBNQKP]/.test(character)) {
                    // set square with piece
                    const squareName = getSquareName(columnNumber, rowNumber)
                    this.setStartingSquare(squareName, Piece.fromString(character,squareName))
                    columnNumber++
                } else {
                    throw new Error("Unrecognized position character: " + character)
                }
            }
        }
    }

    /**
     * Serializes as a FEN string
     */
    serialize(): string
    {
        const columnNames = ['a','b','c','d','e','f','g','h']
        let emptySquares = 0

        let serialized = ''
        for(let row=8;row>=1;row--){
            for(let col =1; col<=8;col++){
                const squareName = columnNames[col - 1] + row.toString()

                // @ts-ignore these will always be valid square names
                const piece = this.getSquare(squareName).piece

                if(piece) {
                    if(emptySquares > 0){
                        serialized += emptySquares.toString()
                        emptySquares = 0
                    }
                    serialized += piece.serialize()
                }else{
                    emptySquares++
                }
            }

            if(emptySquares > 0){
                serialized += emptySquares.toString()
                emptySquares = 0
            }
            if(row > 1){
                serialized += '/'
            }
        }

        return serialized
    }
}