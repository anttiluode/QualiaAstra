/* Confirmation is frozen in docs/GATE3_PROTOCOL.md. Never modify thresholds to fit results. */
const assert=require("node:assert/strict");
require("../gate2_engine.js");
require("../gate3_engine.js");
const G=globalThis.Gate3,summary=G.confirmation();
const meta={protocol:"docs/GATE3_PROTOCOL.md",calendarDate:"2026-11-16",engine:"gate3_engine.js",status:"held-out confirmation"};
console.log("GATE3_CONFIRMATION_JSON="+JSON.stringify({...meta,...summary}));
console.log("Gate 3 frozen gate:",summary.pass?"PASS":"FAIL","counts",JSON.stringify(summary.gates));
assert.equal(summary.rows.length,12);
assert(Object.keys(summary.gates).length===5);
// A negative scientific result is valid. CI only asserts the experiment completed.
