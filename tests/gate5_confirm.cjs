/* Run the independent seeds frozen in docs/GATE5_PROTOCOL.md.
 * The result is not required to PASS for CI; scientific failures remain valid.
 */
const assert=require("node:assert/strict");
require("../gate5_engine.js");
const result=globalThis.Gate5.confirmation();
assert.equal(result.rows.length,12);
assert.equal(Object.keys(result.counts).length,5);
console.log("GATE5_CONFIRMATION_JSON="+JSON.stringify(result));
console.log("Gate 5 independent criteria",result.passed?"PASS":"FAIL",JSON.stringify(result.counts));
