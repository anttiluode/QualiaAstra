/* Gate 6: calibration, raw-wave-only inference, source symmetry and causal tests */
const assert=require("node:assert/strict");
require("../gate5_engine.js");
require("../gate6_engine.js");
const G=globalThis.Gate6, G5=globalThis.Gate5;
assert(G&&G5&&G.N===48);
const model=G.train(17001,512,320);
assert.deepEqual(G.train(17001,512,320),model,"All calibration must be reproducible");
assert(model.decoders.cable.calibrationCounts[0]===320);
assert(model.decoders.cable.calibrationCounts[1]===320);
assert.deepEqual(G.shape("equalized","actual",0),G.shape("equalized","replay",0),
 "Null condition must physically erase the class distinction");
for(const source of ["actual","replay"]){
 for(const mode of G.MODES){
 const clean=G.shape(mode,source,0);
 assert(Math.abs(clean.reduce((a,v)=>a+v*v,0)-1)<1e-12,
 "Physical signature cannot leak source via clean-wave power");
 }
}
const n={jitter:0,amp:2.6,noise:Array(G.N).fill(0)};
const report={A:1,z:1,p:.95};
const realTrace=G.waveform("cable","actual",1,n),echoTrace=G.waveform("cable","replay",1,n);
const real=G.infer(model,{...report,trace:realTrace});
const echo=G.infer(model,{...report,trace:echoTrace});
assert(real.probReal>echo.probReal+.3,
 "Different physical paths must create different source likelihoods");
assert(real.mC>echo.mC);
const poisoned={...report,trace:echoTrace,provenance:"actual",B:999,C:-999,truth:"whatever",path:"basal"};
assert.deepEqual(G.infer(model,poisoned),echo,
 "The receiver must not use injected provenance, compartment, B or C truth");
assert.deepEqual(G.infer(model,{...report,trace:echoTrace}),echo);
const cut=G.infer(model,{...report,trace:echoTrace},"cable",{cutBC:true});
assert.equal(cut.mC,0);
assert.equal(cut.mB,echo.mB);
assert(echo.mB>0&&echo.mC>0);
const eqNoise={jitter:1,amp:2.6,noise:Array(G.N).fill(.03)};
assert.deepEqual(G.waveform("equalized","actual",1,eqNoise),
 G.waveform("equalized","replay",1,eqNoise));
assert.deepEqual(G.waveform("cable","actual",1,eqNoise,true),
 G.waveform("cable","replay",1,eqNoise,false),
 "Source swap is a genuine waveform causal intervention");
assert(Object.values(G.mechanism(model).checks).every(Boolean));
const result=G.evaluate(model,18001,2048);
assert(result.mse.cable<1&&result.mse.oracle<result.mse.blind);
assert(result.sourceAccuracy.cable.ambiguous>.85);
assert(result.sourceAccuracy.spike.ambiguous>.60);
assert(Math.abs(result.mse.equalized-result.mse.blind)<.01);
console.log("Gate 6 development checks:",JSON.stringify({results:result.mse,ambiguousSourceAccuracy:result.sourceAccuracy.cable.ambiguous,
 mechanism:G.mechanism(model).checks}));
