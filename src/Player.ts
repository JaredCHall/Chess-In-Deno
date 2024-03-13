
export type PlayerColor = 'w' | 'b'

export class Player {

    static readonly WHITE = 'w'

    static readonly BLACK = 'b'

    static sanitizeColor(color:string): PlayerColor
    {
        switch(color){
            case 'w':
            case 'b':
                return color
            default:
                throw new Error(`Invalid player color: '${color}'.`)
        }
    }

}