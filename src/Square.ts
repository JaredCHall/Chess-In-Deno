import {Piece} from "./Piece.ts";


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

export class Square {

    readonly name: SquareName

    readonly color: SquareColor

    readonly rank: SquareRank

    readonly file: SquareFile

    piece: Piece|null  = null


    constructor(file: SquareFile, rank: SquareRank, color: SquareColor) {

        this.color = color
        this.rank = rank
        this.file = file
        this.name = Square.getSquareName(this.file, this.rank)
    }

    setPiece(piece: Piece|null|string){

        if(typeof piece === 'string'){
            piece = Piece.fromString(piece, this.name)
        }

        this.piece = piece
    }

    hasPiece(): boolean
    {
        return this.piece !== null
    }

    getPiece(): Piece
    {
        if(!this.piece){
            throw new Error('Square does not have a piece.')
        }

        return this.piece
    }
    
    static sanitizeName(name: string): SquareName
    {
        switch(name){
            case 'a8': case 'b8': case 'c8': case 'd8': case 'e8': case 'f8': case 'g8': case 'h8':
            case 'a7': case 'b7': case 'c7': case 'd7': case 'e7': case 'f7': case 'g7': case 'h7':
            case 'a6': case 'b6': case 'c6': case 'd6': case 'e6': case 'f6': case 'g6': case 'h6':
            case 'a5': case 'b5': case 'c5': case 'd5': case 'e5': case 'f5': case 'g5': case 'h5':
            case 'a4': case 'b4': case 'c4': case 'd4': case 'e4': case 'f4': case 'g4': case 'h4':
            case 'a3': case 'b3': case 'c3': case 'd3': case 'e3': case 'f3': case 'g3': case 'h3':
            case 'a2': case 'b2': case 'c2': case 'd2': case 'e2': case 'f2': case 'g2': case 'h2':
            case 'a1': case 'b1': case 'c1': case 'd1': case 'e1': case 'f1': case 'g1': case 'h1':
                return name
            default:
                throw new Error(`Square with name '{$name}' does not exist.`)
        }
    }

    static getSquareName(file: SquareFile, rank: SquareRank): SquareName
    {
        //@ts-ignore this is always valid
        return file + rank.toString()
    }


}