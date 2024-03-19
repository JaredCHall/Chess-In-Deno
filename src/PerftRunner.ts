import { Move } from "./Move.ts";
import {MoveFactory} from "./MoveFactory.ts";
import { FenNumber } from "./FenNumber.ts";
import {format} from "https://deno.land/std@0.220.1/fmt/duration.ts";


export class PerftCounter {
    nodes: number
    captures: number
    passants: number
    castles: number
    promotions: number
    checks: number
    discoveredChecks: number
    doubleChecks: number
    checkMates: number

    constructor(
        nodes: number = 0,
        captures: number = 0,
        passants: number = 0,
        castles: number = 0,
        promotions: number = 0,
        checks: number =  0,
        discoveredChecks: number = 0,
        doubleChecks: number = 0,
        checkMates: number = 0,
    ) {
        this.nodes = nodes
        this.captures = captures
        this.passants = passants
        this.castles = castles
        this.promotions = promotions
        this.checks = checks
        this.discoveredChecks = discoveredChecks
        this.doubleChecks = doubleChecks
        this.checkMates = checkMates
    }

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
        if(move.promoteType){
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
    counter: PerftCounter
    runTime: number = 0// milliseconds

    constructor(startFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        this.factory = new MoveFactory(new FenNumber(startFen))
        this.counter = new PerftCounter()
    }

    run(depth: number=0): PerftCounter
    {
        if(depth === 0){
            this.counter.nodes++
            return this.counter
        }
        const start = (new Date()).getTime()
        this.perft(depth)
        this.runTime = new Date().getTime() - start

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