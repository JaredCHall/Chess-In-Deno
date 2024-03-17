import { Board } from "./Board.ts";
import { Move } from "./Move.ts";
import {MoveHandler} from "./MoveHandler.ts";
import {MoveFactory} from "./MoveFactory.ts";
import { FenNumber } from "./FenNumber.ts";


class Counter {
    nodes: number = 0
    captures: number = 0
    passants: number = 0
    castles: number = 0
    promotions: number = 0
    checks: number =  0
    discoveredChecks: number = 0
    doubleChecks: number = 0
    checkMates: number = 0

    update(move: Move): void
    {
        this.nodes++
        if(move.captured){
            this.captures++
        }
        if(move.type === 'en-passant'){
            this.passants++
        }else if(move.type === 'castles'){
            this.castles++
        }
        if(move.type === 'pawn-promotion'){
            this.promotions++
        }
        if(move.isCheck){
            this.checks++
            if(move.isMate){
                this.checkMates++
            }
        }
    }
}

export class PerftRunner {

    factory: MoveFactory
    counter: Counter

    constructor(startFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        this.factory = new MoveFactory(new FenNumber(startFen))
        this.counter = new Counter()
    }

    run(depth: number=0): Counter
    {
        if(depth === 0){
            this.counter.nodes++
            return this.counter
        }

        this.perft(depth)

        return this.counter
    }

    perft(depth: number = 0, lastMove: null|Move = null): void
    {
        if(depth === 0 && lastMove){
            this.counter.update(lastMove)
            return
        }
        const n_moves = this.factory.getAllLegalMoves()
        n_moves.forEach((move: Move) => {
            this.factory.handler.makeMove(move)
            this.perft(depth -1, move)
            this.factory.handler.unMakeMove(move)
        })

        return
    }
}