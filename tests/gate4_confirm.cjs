/* Frozen independent-seed gate from docs/GATE4_PROTOCOL.md.
   Scientific failure is a valid outcome; CI checks completion and data integrity. */
const assert=require("node:assert/strict");
require("../gate4_engine.js");
const s=globalThis.Gate4.confirmation();
assert.equal(s.rows.length,12);
assert.equal(typeof s.H1,"boolean");assert.equal(typeof s.H2,"boolean");
console.log("GATE4_CONFIRMATION_JSON="+JSON.stringify(s));
console.log("GATE4_GATE_OUTCOME H1="+(s.H1?"PASS":"FAIL")+" H2="+(s.H2?"PASS":"FAIL"));
