import {Square, SquareName, SquareRank} from "./Square.ts";
import {FenNumber} from "../FenNumber.ts";
import {Piece} from "./Piece.ts";
import {PieceMap} from "./PieceMap.ts";
import {BoardState} from "./BoardState.ts";
import {
    bgBrightBlue,
    bgBrightGreen,
    bgBrightMagenta,
    black,
    bold,
    dim,
    white
} from "https://deno.land/std@0.219.1/fmt/colors.ts";

export type BoardSquares = Record<SquareName, Square>
export type BoardPositions = Record<number, BoardState> // indexed by move ply
/**
 * Board - Represents the state of the board
 */
export class Board
{
    readonly squares: BoardSquares

    readonly squares10x12: (Square|null)[] = []

    readonly pieceMap: PieceMap = new PieceMap()

    readonly positions: BoardPositions = {}

    boardState: BoardState = new BoardState() // current board state

    constructor(fenNumber: FenNumber|string = '8/8/8/8/8/8/8/8') {

        fenNumber = new FenNumber(fenNumber)
        // build squares and set pieces from FenNumber
        this.squares = this.#buildSquareSet()
        this.#setPiecePositions(fenNumber)
        this.boardState.castleRights = fenNumber.castleRights
        this.boardState.enPassantTarget = fenNumber.enPassantTarget
        this.boardState.halfMoveClock = fenNumber.halfMoveClock
        this.boardState.ply = fenNumber.ply
        this.boardState.sideToMove = fenNumber.sideToMove
    }

    getPiece(squareName: SquareName): Piece|null {
        return this.squares[squareName].piece
    }

    setPiece(square: SquareName, piece: Piece|null): void {
        this.squares[square].setPiece(piece)
    }
    setEmpty(square: SquareName): void {
        this.squares[square].setEmpty()
    }

    getSquare(square: SquareName): Square {
        return this.squares[square]
    }

    getSquareByIndex(index: number): Square|null {
        return this.squares10x12[index]
    }

    saveCurrentState(): void {
        this.positions[this.boardState.ply] = this.boardState.clone()
    }

    restoreLastState(): void {
        const currentPly = this.boardState.ply
        this.boardState = this.positions[this.boardState.ply - 1]
        delete this.positions[currentPly]
    }

    /**
     * Serializes as a FEN string
     */
    serialize(): string {
        const files = Square.files
        let emptySquares = 0
        let serialized = ''
        for(let row=8;row>=1;row--){
            for(let col =1; col<=8;col++){
                // @ts-ignore these will always be valid square names
                const piece = this.getPiece(files[col-1] + row.toString())

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

    render(highlights: SquareName[] = []): void {

        console.log(dim(this.serialize()))

        const squaresByRank: Record<SquareRank, Square[]> = {8: [], 7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: []}
        Object.values(this.squares).forEach((square: Square) => {
            squaresByRank[square.rank].push(square)
        });

        const pieceMap = {
            p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
            P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔'
        }

        Square.ranks.forEach((rank: SquareRank) => {
            const pieces = squaresByRank[rank].map((square: Square) => {
                const piece = square.piece

                let outVal = piece ? pieceMap[piece.type] + ' ' : '  '

                if(highlights.includes(square.name)){
                    outVal = bgBrightGreen(outVal)
                }else{
                    outVal = square.color === 'light' ? bgBrightBlue(outVal) : bgBrightMagenta(outVal)
                }

                outVal = piece?.color === 'w' ? bold(white(outVal)) : bold(black(outVal))

                return outVal
            })
            console.log(pieces.join(''))
        })
    }

    #setPiecePositions(fenNumber: FenNumber) {
        this.pieceMap.flush()

        const files = Square.files
        const rows = fenNumber.piecePlacements.split('/').reverse()
        if (rows.length !== 8) {throw new Error('FEN piece placement must include all eight rows')}

        const getSquareName = (columnNumber: number, row: number): SquareName => {
            // @ts-ignore always valid
            return files[columnNumber - 1] + row.toString()
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
                        this.setPiece(getSquareName(columnNumber, rowNumber), null)
                        columnNumber++
                    }
                } else if (/[rbnqkpRBNQKP]/.test(character)) {
                    // set square with piece
                    const squareName = getSquareName(columnNumber, rowNumber)
                    const piece = Piece.fromString(character, squareName)
                    this.setPiece(squareName, piece)
                    this.pieceMap.addPiece(piece)
                    columnNumber++
                } else {
                    throw new Error("Unrecognized position character: " + character)
                }
            }
        }
    }

    #buildSquareSet(): BoardSquares {
        const squares: Partial<BoardSquares> = {}

        // fill 10x12 array with nulls
        for(let i =0; i < 120; i++){
            this.squares10x12[i] = null
        }

        Square.squaresOrder.forEach((squareName: SquareName) => {
            const square = Square.fromString(squareName)
            squares[squareName] = square
            this.squares10x12[square.index10x12] = square
        })
        // @ts-ignore this is correct actually
        return squares
    }

}