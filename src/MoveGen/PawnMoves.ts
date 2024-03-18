import {PlayerColor} from "../Player.ts";

export type PawnMoveOffsetType = 'single'|'double'|'capture'
export type PawnMoveOffsets = Record<PawnMoveOffsetType, number[]>

export class PawnMoves
{
    static readonly whiteOffsetMap: PawnMoveOffsets = {single: [-10], double: [-20], capture: [-9, -11]}
    static readonly blackOffsetMap: PawnMoveOffsets = {single: [10], double: [20], capture: [9, 11]}

    static readonly offsetMap: Record<PlayerColor, PawnMoveOffsets> = {
        w: this.whiteOffsetMap,
        b: this.blackOffsetMap
    }

    static getOffsets(color: PlayerColor): PawnMoveOffsets
    {
        return PawnMoves.offsetMap[color]
    }
}