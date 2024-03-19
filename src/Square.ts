import {Piece} from "./Piece.ts";
import {PlayerColor} from "./Player.ts";

export type SquareName = 'a1'|'a2'|'a3'|'a4'|'a5'|'a6'|'a7'|'a8'|
    'b1'|'b2'|'b3'|'b4'|'b5'|'b6'|'b7'|'b8'|
    'c1'|'c2'|'c3'|'c4'|'c5'|'c6'|'c7'|'c8'|
    'd1'|'d2'|'d3'|'d4'|'d5'|'d6'|'d7'|'d8'|
    'e1'|'e2'|'e3'|'e4'|'e5'|'e6'|'e7'|'e8'|
    'f1'|'f2'|'f3'|'f4'|'f5'|'f6'|'f7'|'f8'|
    'g1'|'g2'|'g3'|'g4'|'g5'|'g6'|'g7'|'g8'|
    'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'h7'|'h8'

export type SquareColor = 'light'|'dark'

export type SquareRank = 1|2|3|4|5|6|7|8

export type SquareFile = 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'

export class SquareCoordinate
{
    readonly column: number
    readonly row: number
    constructor(column: number, row: number) {
        this.column = column
        this.row = row
    }
}

export class Square {

    static readonly squaresOrder: SquareName[] = [
        'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
        'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
        'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
        'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
        'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
        'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
        'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
        'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
    ];

    static readonly lightSquares: SquareName[] = [
        'a8', 'c8', 'e8', 'g8', 'b7', 'd7', 'f7', 'h7',
        'a6', 'c6', 'e6', 'g6', 'b5', 'd5', 'f5', 'h5',
        'a4', 'c4', 'e4', 'g4', 'b3', 'd3', 'f3', 'h3',
        'a2', 'c2', 'e2', 'g2', 'b1', 'd1', 'f1', 'h1',
    ]

    static readonly files: SquareFile[] = ['a','b','c','d','e','f','g','h']

    static readonly ranks: SquareRank[] = [8,7,6,5,4,3,2,1]

    readonly name: SquareName

    readonly color: SquareColor

    readonly rank: SquareRank

    readonly file: SquareFile

    piece: Piece|null  = null // square references piece references square references piece

    readonly coordinates: Record<PlayerColor, SquareCoordinate> // [x,y] coordinates for each orientation

    readonly index10x12: number

    constructor(file: SquareFile, rank: SquareRank) {
        this.rank = rank
        this.file = file
        this.name = Square.getName(file, rank)
        this.color = Square.lightSquares.includes(this.name) ? 'light' : 'dark'
        this.coordinates = Square.getCoordinates(this.name)
        this.index10x12 = this.getIndex10x12()
    }

    static sanitizeName(name: string): SquareName {
        //@ts-ignore its fine
        if(!Square.squaresOrder.includes(name)){
            throw new Error(`Square with name '{$name}' does not exist.`)
        }
        //@ts-ignore still fine
        return name
    }

    static getName(file: SquareFile, rank: SquareRank): SquareName {
        // @ts-ignore always valid
        return file + rank.toString()
    }

    static getCoordinates(squareName: SquareName): Record<PlayerColor, SquareCoordinate> {
        const index = Square.squaresOrder.indexOf(squareName);
        const col = index % 8;
        const row = Math.floor(index / 8)
        // return coordinates for both orientations
        return {
            w: new SquareCoordinate(col, row),
            b: new SquareCoordinate(col * -1 + 7, row * -1 + 7)
        }
    }

    static fromString(name: string): Square {
        name = Square.sanitizeName(name)
        // @ts-ignore always valid
        return new Square(name.charAt(0), parseInt(name.charAt(1)))
    }

    setPiece(piece: Piece|null){
        this.piece = piece
        if(piece){
            piece.square = this.name
        }
    }

    isAdjacentTo(square: Square): boolean {
        // orientation is irrelevant
        const colDiff = Math.abs(this.coordinates.w.column - square.coordinates.w.column)
        const rowDiff = Math.abs(this.coordinates.w.row - square.coordinates.w.row)
        return colDiff <= 1 && rowDiff <= 1
    }

    // is this square advanced or in front of another square from chosen player's perspective
    isAdvancedOf(square: Square, color: PlayerColor): boolean {
        return (color === 'w' && this.rank > square.rank)
            || (color === 'b' && this.rank < square.rank)
    }

    isPawnPromotionSquare(color: PlayerColor): boolean {
        if(color === 'w'){
            return this.rank === 8
        }
        return this.rank === 1
    }

    isPawnStartSquare(color: PlayerColor): boolean {
        if(color === 'w'){
            return this.rank === 2
        }
        return this.rank === 7
    }

    getIndex10x12(): number {
        return (Square.ranks.indexOf(this.rank)) * 10 + Square.files.indexOf(this.file) + 21
    }


}