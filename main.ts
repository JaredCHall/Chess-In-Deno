import {parseArgs} from "https://deno.land/std@0.219.0/cli/parse_args.ts";
import { format } from "https://deno.land/std@0.220.1/fmt/duration.ts";
import {PerftRunner} from "./src/MoveGen/PerftRunner.ts";
import { green } from "https://deno.land/std@0.219.1/fmt/colors.ts";

const args = parseArgs(Deno.args, {
    string: ['depth']
})
const depth = parseInt(args.depth ?? '1')
const runner = new PerftRunner()
const counters = runner.run(depth)
const elapsed = format(runner.runTime, {ignoreZero: true})
console.table(counters)
console.log(green(`RunTime: ${elapsed}`))