/* Gate 7: screen-off/direct shortcut, imagined-B relay and physical-origin invariants */
const assert=require("node:assert/strict");
require("../gate5_engine.js");
require("../gate6_engine.js");
require("../gate7_engine.js");
const E=globalThis.Gate7,F=globalThis.Gate6,G=globalThis.Gate5;
const model=E.train(17001,512,320);
assert.deepEqual(model.screen,E.fit(17001,512),"Same independent full-observation calibration");
assert(Math.abs(model.screen.weights.residual.A)<.15);
assert(Math.abs(model.screen.weights.similarity.A)>.35);
assert.deepEqual(model.screen.weights.residual,model.screen.weights.jointOls,
 "Residual screening in this world is exactly ordinary joint least squares");
const n={jitter:0,amp:2.6,noise:Array(G.N).fill(0)};
const input=(A,z,source)=>({A,z,p:.95,trace:F.waveform("cable",source,z,n)});
const imagined=input(1,1,"replay"),real=input(1,1,"actual"),contradiction=input(1,-1,"actual");
const r=E.predict(model,imagined),p=E.predict(model,real),neg=E.predict(model,contradiction);
assert(r.mB>.25&&r.mC>.05,"Imagined B must be held and passed to C");
assert(p.mB>r.mB,"Fresh evidence revises rather than repeats B");
assert(neg.mC<0&&r.mC>0,"Contradictory independent B must reverse C");
const hebb=E.predict(model,contradiction,"similarity");
assert(hebb.mC>neg.mC,"Univariate redundant A shortcut resists contradictory B");
const noRelay=E.predict(model,imagined,"noRelay");
assert(Math.abs(noRelay.mB)<Math.abs(r.mB),"Removing imagined relay must remove retained B state on replay");
const fake={...imagined,provenance:"actual",B:999,C:-999,cTrace:Array(G.N).fill(999),path:"apical"};
assert.deepEqual(E.predict(model,fake),r,"No per-trial source tag, compartment or hidden truth may enter physical inference");
const cut=E.predict(model,imagined,"residual",{cutBC:true});
assert.equal(cut.mB,r.mB);
assert(Math.abs(r.mC-cut.mC-model.screen.weights.residual.B*r.mB)<1e-12,
 "B→C cut removes only the B contribution, not the direct A residual");
const blind=E.predict(model,imagined,"blind");
assert(blind.mB>0);
assert.deepEqual(E.predict(model,imagined,"residual"),E.predict(model,imagined,"jointOls"),
 "Honest equivalent global regression control");
assert.throws(()=>E.predict(model,{A:1,z:1,p:.95},"residual"),/waveform/);
const bench=E.benchmark(model,27001,2048),e=bench.errors;
assert(e.residual<e.similarity-.15);
assert(e.residual<e.noRelay-.06);
assert(e.residual<e.blind+.01);
assert(e.knownSource<e.shortcut);
assert(Math.abs(e.jointOls-e.residual)<1e-14);
assert(bench.byMode.actual.n+bench.byMode.replay.n===2048);
assert(bench.byMode.contradiction.n>100);
assert(Object.values(E.mechanism(model).checks).every(Boolean));
console.log("Gate 7 mechanisms pass:",JSON.stringify({screen:model.screen.weights,source:model.source.seed,errors:e,mechanism:E.mechanism(model).checks}));
