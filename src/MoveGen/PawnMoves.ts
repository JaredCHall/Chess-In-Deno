import {PlayerColor} from "../Player.ts";

export type PawnMoveOffsetType = 'single'|'double'|'capture'
export type PawnMoveOffsets = Record<PawnMoveOffsetType, number[]>

export class PawnMoves
{
    static readonly whiteOffsetMap: PawnMoveOffsets = {single: [-12], double: [-24], capture: [-11, -13]}
    static readonly blackOffsetMap: PawnMoveOffsets = {single: [12], double: [24], capture: [11, 13]}

    static readonly offsetMap: Record<PlayerColor, PawnMoveOffsets> = {
        w: this.whiteOffsetMap,
        b: this.blackOffsetMap
    }

    static getOffsets(color: PlayerColor): PawnMoveOffsets
    {
        return PawnMoves.offsetMap[color]
    }
}