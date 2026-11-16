/* Gate 4 mechanism tests: timing, topology freedom, separation of prediction and residual */
const assert=require("node:assert/strict");
require("../gate4_engine.js");
const G=globalThis.Gate4;
assert(G && G.N===4 && G.DELAYS===12 && G.BUDGET===2);
const a=G.train(4001,160,"residual"),b=G.train(4001,160,"hebb"),c=G.train(4001,160,"coactivity"),o=G.train(4001,160,"oracle"),dead=G.train(4001,160,"dead");
assert.deepEqual(a,G.train(4001,160,"residual"),"Deterministic training");
for(const m of [a,b,c,o]){assert.equal(m.edges.length,2);assert(m.edges.every(e=>e.delay>=1&&e.delay<=12&&e.src!==e.dst));}
assert.deepEqual(a.edges.map(e=>[e.src,e.dst,e.delay]),[[1,2,5],[0,1,5]]);
const d=G.cases(9911,1)[0],pred=G.replay(a,d.world),cut=G.replay(a,d.world,{cut:"BC"});
assert(pred.pred[1].some(v=>Math.abs(v)>1e-4));
assert(pred.pred[2].some(v=>Math.abs(v)>1e-4),"C must read internally predicted B");
assert.deepEqual(cut.pred[1],pred.pred[1],"B state must persist after cutting B→C");
assert(cut.pred[2].every(v=>v===0),"C must lose prediction after B→C cut");
const altered=d.world.map(x=>x.slice());for(let j=1;j<4;j++)altered[j].fill(1000+j);
assert.deepEqual(G.replay(a,altered).pred,pred.pred,"Test-world B/C/D must not enter predictive replay");
assert.deepEqual(G.replay(dead,d.world).pred.slice(1),[Array(G.T).fill(0),Array(G.T).fill(0),Array(G.T).fill(0)]);
const measured=G.benchmark(4001);
assert(measured.correctEdges===2&&measured.correctDelays===2);
assert(measured.metrics.residual.error<.6);
assert(measured.metrics.dead.error===1);
assert(measured.metrics.dead.surpriseRate>measured.metrics.residual.surpriseRate,
 "Silencing an output is not the same as reducing sensory residual");
console.log("Gate 4 development checks pass:",JSON.stringify({topology:a.edges,metrics:measured.metrics}));
