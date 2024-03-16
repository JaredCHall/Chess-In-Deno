import {Square, SquareName} from "./Square.ts";
import {Player, PlayerColor} from "./Player.ts";

export type CastleRight = 'k' | 'K' | 'q' | 'Q'

/**
 * This is an extended FenNumber, which includes isCheck, isMate and isStalemate fields in addition
 * to the typical FenNumber fields. https://www.chessprogramming.org/Forsyth-Edwards_Notation
 */
export class FenNumber {

    piecePlacements: string

    sideToMove: PlayerColor = 'w'

    castleRights: CastleRight[] = []

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

    getCastleRightsForColor(color: PlayerColor): CastleRight[]
    {
        const typesForColor = color === 'w' ? ['K','Q'] : ['k','q']
        return this.castleRights.filter(value => typesForColor.includes(value));
    }

    revokeCastleRights(rights: CastleRight[]){
        this.castleRights = this.castleRights.filter((right: CastleRight) => !rights.includes(right))
    }

    #sanitizeCastleRights(castleRights: string): CastleRight[] {
        return castleRights.split('')
            .map((right) => FenNumber.sanitizeCastleRight(right))

    }

    static sanitizeCastleRight(castleRight: string): CastleRight {
        switch(castleRight){
            case 'k': case 'K': case 'Q': case 'q':
                return castleRight
            default:
                throw new Error(`Invalid CastleRight: ${castleRight}.`)
        }
    }

    serialize(withExtended: boolean = false): string
    {
        const commonParts = [
            this.piecePlacements,
            this.sideToMove,
            this.castleRights.length > 0 ? this.castleRights.join('') : '-',
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