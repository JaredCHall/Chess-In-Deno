import {Square, SquareName, SquareRank} from "./Square.ts";
import {FenNumber} from "./FenNumber.ts";
import {Piece, PromotionType} from "./Piece.ts";
import { PieceMap } from "./PieceMap.ts";
import {PlayerColor} from "./Player.ts";
import {
    bgBlue,
    bgBrightBlue,
    bgBrightCyan, bgBrightGreen,
    bgBrightMagenta,
    bgBrightYellow, bgRed, bgYellow,
    black,
    bold,
    dim,
    white
} from "https://deno.land/std@0.219.0/fmt/colors.ts";


export type BoardSquares = Record<SquareName, Square>

/**
 * Board - Represents the state of the board
 *
 * Consists of 3 main properties:
 * - squares: the 64 squares
 * - fenNumber: represents piece positions and game state
 * - pieceSet: an object providing quick reference to current piece positions (avoids searching every square for a piece)
 *
 */
export class Board
{
    readonly squares: BoardSquares

    readonly pieceMap: PieceMap = new PieceMap()

    constructor(fenNumber: FenNumber|string = '8/8/8/8/8/8/8/8') {

        // build squares and set pieces from FenNumber
        this.squares = this.#buildSquareSet()
        this.#setPiecePositions(new FenNumber(fenNumber))
    }

    getPiece(squareName: SquareName): Piece|null {
        return this.squares[squareName].piece
    }

    setPiece(square: SquareName, piece: Piece|null): void {
        this.squares[square].setPiece(piece)
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
        Square.squaresOrder.forEach((square: SquareName) => {
            squares[square] = Square.fromString(square)
        })
        // @ts-ignore this is correct actually
        return squares
    }

}