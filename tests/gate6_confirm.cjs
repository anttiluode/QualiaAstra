/* Frozen Gate 6 twelve-seed confirmation.
   A failed scientific hypothesis must remain a valid CI receipt. */
const assert=require("node:assert/strict");
require("../gate5_engine.js");
require("../gate6_engine.js");
const result=globalThis.Gate6.confirmation();
assert.equal(result.rows.length,12);
assert.equal(Object.keys(result.counts).length,6);
assert(result.rows.every(x=>x.result.n===4096));
console.log("GATE6_CONFIRMATION_JSON="+JSON.stringify(result));
console.log("Gate 6 gate outcome:",result.passed?"PASS":"FAIL",JSON.stringify(result.counts));
