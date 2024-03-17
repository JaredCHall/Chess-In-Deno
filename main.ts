import {FenNumber} from "./src/FenNumber.ts";
import {MoveFactory} from "./src/MoveFactory.ts";
import {parseArgs} from "https://deno.land/std@0.219.0/cli/parse_args.ts";
import { format } from "https://deno.land/std@0.220.1/fmt/duration.ts";

const fenNumber = new FenNumber('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
const factory = new MoveFactory(fenNumber)

const args = parseArgs(Deno.args, {
    string: ['depth']
})

const depth = parseInt(args.depth ?? '1')
console.log(`Calculating perft at depth: ${depth}`)
const start = (new Date()).getTime()
console.log(factory.perft(depth))
const elapsed = format((new Date()).getTime() - start, {ignoreZero: true})
console.log(`Elapsed time: ${elapsed}`)