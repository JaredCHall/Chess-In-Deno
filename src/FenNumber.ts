import { CastlingRight } from "./MoveGen/Move.ts";
import {Square, SquareName} from "./MoveGen/Square.ts";
import {Player, PlayerColor} from "./Player.ts";


const fenCastlingTypeMap = {
    K: CastlingRight.K,
    Q: CastlingRight.Q,
    k: CastlingRight.k,
    q: CastlingRight.q
}

/**
 * This is an extended FenNumber, which includes isCheck, isMate and isStalemate fields in addition
 * to the typical FenNumber fields. https://www.chessprogramming.org/Forsyth-Edwards_Notation
 */
export class FenNumber {

    piecePlacements: string

    sideToMove: PlayerColor = 'w'

    castleRights: number = 0b0000

    enPassantTarget: null | SquareName = null

    halfMoveClock: number = 0

    fullMoveCounter: number = 1

    isCheck: boolean = false

    isMate: boolean = false

    isStalemate: boolean = false

    constructor(fen: string | FenNumber = '8/8/8/8/8/8/8/8') {

        if (fen instanceof FenNumber) {
            this.piecePlacements = fen.piecePlacements
            this.sideToMove = fen.sideToMove
            this.castleRights = fen.castleRights
            this.enPassantTarget = fen.enPassantTarget
            this.halfMoveClock = fen.halfMoveClock
            this.fullMoveCounter = fen.fullMoveCounter
            this.isCheck = fen.isCheck
            this.isMate = fen.isMate
            this.isStalemate = fen.isStalemate

            return
        }

        const parts = fen.split(' ')

        this.piecePlacements = parts[0]
        this.sideToMove = Player.sanitizeColor(parts[1] ?? 'w')
        this.isCheck = (parts[6] ?? null) === '1'
        this.isMate = (parts[7] ?? null) === '1'
        this.isStalemate = (parts[8] ?? null) === '1'

        if (parts[2] && parts[2] !== '-') {
            this.castleRights = this.#sanitizeCastleRights(parts[2])
        }

        if (parts[3] && parts[3] !== '-') {
            this.enPassantTarget = Square.sanitizeName(parts[3])
        }

        if (parts[4] && parts[4] !== '-') {
            this.halfMoveClock = parseInt(parts[4])
        }

        if (parts[5] && parts[5] !== '-') {
            this.fullMoveCounter = parseInt(parts[5])
        }
    }

    get ply(): number
    {
        return (this.fullMoveCounter - 1) * 2 + (this.sideToMove === 'b' ? 1 : 0)
    }

    #sanitizeCastleRights(castleRights: string): number {

        return castleRights.split('')
            .map((right) => FenNumber.sanitizeCastleRight(right))
            .reduce((carry, right) => carry | right, 0)

    }

    static sanitizeCastleRight(castleRight: string): CastlingRight {
        switch(castleRight){
            case 'K': return CastlingRight.K
            case 'Q': return CastlingRight.Q
            case 'k': return CastlingRight.k
            case 'q': return CastlingRight.q
            default:
                throw new Error(`Invalid CastleRight: ${castleRight}.`)
        }
    }

    serialize(withExtended: boolean = false): string
    {
        let castlingRightsPart = ''
        if(this.castleRights | CastlingRight.K){castlingRightsPart += 'K'}
        if(this.castleRights | CastlingRight.Q){castlingRightsPart += 'Q'}
        if(this.castleRights | CastlingRight.k){castlingRightsPart += 'k'}
        if(this.castleRights | CastlingRight.q){castlingRightsPart += 'Q'}

        const commonParts = [
            this.piecePlacements,
            this.sideToMove,
            castlingRightsPart.length > 0 ? castlingRightsPart : '-',
            this.enPassantTarget ?? '-',
            this.halfMoveClock,
            this.fullMoveCounter
        ]

        if(!withExtended){
            return commonParts.join(' ')
        }

        return commonParts.concat([
            this.isCheck ? '1' : '0',
            this.isMate ? '1' : '0',
            this.isStalemate ? '1' : '0'
        ]).join(' ')
    }

}