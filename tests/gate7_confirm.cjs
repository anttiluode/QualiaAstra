/* Gate 7 hold-out protocol is committed before 770001..770012 are evaluated.
 * Scientific gate FAIL is valid evidence, not a test-runner exception. */
const assert=require("node:assert/strict");
require("../gate5_engine.js");
require("../gate6_engine.js");
require("../gate7_engine.js");
const result=globalThis.Gate7.confirmation();
assert.equal(result.rows.length,12);
assert.equal(Object.keys(result.counts).length,7);
assert(result.rows.every(x=>x.outcome.n===4096));
console.log("GATE7_CONFIRMATION_JSON="+JSON.stringify(result));
console.log("Gate 7 scientific decision",result.passed?"PASS":"FAIL",JSON.stringify(result.counts));
