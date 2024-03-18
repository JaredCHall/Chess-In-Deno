import {PerftCounter, PerftRunner} from "../src/PerftRunner.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";


// https://www.chessprogramming.org/Perft_Results
const expectedResults = {
    1: new PerftCounter(20,0,0,0,0,0,0,0,0),
    2: new PerftCounter(400,0,0,0,0,0,0,0,0),
    3: new PerftCounter(8902,34,0,0,0,12,0,0,0),
    4: new PerftCounter(197281, 1576,0,0,0,469,0,0,8),
    5: new PerftCounter(4865609,82719,258,0,0,27351,6,0,347),
    6: new PerftCounter(119060324,2812008,5248,0,0,809099,329,46,10828),
}

const getPerftResult = (depth: number) => {
    const runner = new PerftRunner()
    const result = runner.run(depth)
    console.table(result)
    return result
}

const assertResultMatches = (actual: PerftCounter, depth: number) =>
{
    // @ts-ignore - it's fine
    const expected = expectedResults[depth] ?? null
    assertEquals(actual.nodes, expected.nodes, `Incorrect node count`)
    assertEquals(actual.captures, expected.captures, `Incorrect capture count`)
    assertEquals(actual.passants, expected.passants, `Incorrect en-passant count`)
    assertEquals(actual.castles, expected.castles, `Incorrect castles count`)
    assertEquals(actual.promotions, expected.promotions, `Incorrect promotions count`)
    assertEquals(actual.checks, expected.checks, `Incorrect checks count`)
    //TODO: Add discovered/double check detection
    //assertEquals(actual.discoveredChecks, expected.discoveredChecks, `Incorrect discovered checks count`)
    //assertEquals(actual.doubleChecks, expected.doubleChecks, `Incorrect double checks count`)
    assertEquals(actual.checkMates, expected.checkMates, `Incorrect check mates count`)
}

Deno.test('It passes perft 1', () => {
    assertResultMatches(getPerftResult(1),1)
})

Deno.test('It passes perft 2', () => {
    assertResultMatches(getPerftResult(2),2)
})

Deno.test('It passes perft 3', () => {
    assertResultMatches(getPerftResult(3),3)
})

Deno.test('It passes perft 4', () => {
    assertResultMatches(getPerftResult(4),4)
})

Deno.test('It passes perft 5', () => {
    assertResultMatches(getPerftResult(5),5)
})

//TODO: Currently too slow to run
// Deno.test('It passes perft 6', () => {
//     assertResultMatches(getPerftResult(6),6)
// })