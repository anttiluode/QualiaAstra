/* QualiaAstra Gate 7 — Conditional residual screening + imagined B + waveform origin.
   Depends on Gate5 and Gate6. See docs/GATE7_PROTOCOL.md (committed before
   confirmation). Training observes A/B/C and knows the two candidate axes;
   online physical inference NEVER reads the true source or hidden B/C. */
(function(root){"use strict";
const G5=root.Gate5,G6=root.Gate6;
if(!G5||!G6)throw Error("Gate 7 needs gate5_engine.js and gate6_engine.js");
const KEYS=["residual","similarity","similarityGain","noRelay","blind","knownSource","oracle","swapped","equalized","shortcut","jointOls"];
function fit(seed,n=512){
 const observed=G5.cases(seed,n);let ab=0,bc=0,ac=0;
 for(const o of observed){ab+=o.A*o.B;bc+=o.B*o.C;ac+=o.A*o.C;}
 ab/=n;bc/=n;ac/=n;
 const direct=(ac-ab*bc)/(1-ab*ab+1e-12),relay=bc-ab*direct;
 const hebb={A:ac,B:bc};
 const gain=(ac*hebb.A+bc*hebb.B)/
  (hebb.A*hebb.A+hebb.B*hebb.B+2*ab*hebb.A*hebb.B+1e-12);
 return {seed,n,correlations:{ab,bc,ac},
  weights:{residual:{A:direct,B:relay},similarity:hebb,
   similarityGain:{A:gain*ac,B:gain*bc},jointOls:{A:direct,B:relay}},
  gain,description:"Two candidate C predictors A and B, with conditional vs separate univariate signed fits"};
}
function train(seed=17001,n=512,probes=320){
 return {seed,n,probes,screen:fit(seed,n),source:G6.train(seed+401,n,probes),
  note:"Known chain, full ABC weight training and known-source isolated waveform calibration; no live provenance bit"};
}
function predict(model,report,policy="residual",options={}){
 if(!KEYS.includes(policy))throw Error("Unknown Gate 7 policy");
 const {A,z,p,trace}=report;
 if((A!==1&&A!==-1)||(z!==1&&z!==-1)||!Number.isFinite(p)||p<.5||p>1)throw Error("Invalid A/z/p");
 let mB=0,originReal=null,weights=model.screen.weights.residual,sourceMode="cable";
 if(policy==="oracle"){
   const ideal=G5.infer({rho1:G5.RHO,rho2:G5.RHO},{A,z,p,provenance:report.provenance},"oracle");
   if(!["actual","replay"].includes(report.provenance))throw Error("Ground-truth oracle requires source");
   return {mB:ideal.mB,mC:options.cutBC?0:ideal.mC,sourceProbability:null,wA:0,wB:G5.RHO,
    provenanceUsed:"Known-source *oracle only*",predictedTrace:Array.from({length:G5.N},(_,t)=>(options.cutBC?0:ideal.mC)*G5.profile(t))};
 }
 if(policy==="shortcut"){
   const mC=options.cutBC?model.screen.correlations.ac*A:model.screen.correlations.ac*A;
   return {mB:0,mC,sourceProbability:null,wA:model.screen.correlations.ac,wB:0,
    provenanceUsed:"No B source or physical waveform",predictedTrace:Array.from({length:G5.N},(_,t)=>mC*G5.profile(t))};
 }
 if(policy==="knownSource"){
   const v=G5.infer(model.source.relations,{A,z,p,provenance:report.provenance},"aware");
   mB=v.mB;
 }else if(policy==="blind"){
   const v=G5.infer(model.source.relations,{A,z,p},"blind");
   mB=v.mB;originReal=v.actualProbability;
 }else{
   if(!Array.isArray(trace))throw Error("Live receiver needs a waveform");
   sourceMode=policy==="equalized"?"equalized":"cable";
   const v=G6.infer(model.source,{A,z,p,trace},sourceMode);
   mB=v.mB;originReal=v.probReal;
   if(policy==="noRelay"){
    const prior=model.source.relations.rho1*A,k=2*p-1;
    const realMean=(prior+k*z)/(1+prior*k*z);
    // Crucial: no hidden mode bit is read. Only the learned soft source
    // probability suppresses the internally generated B branch.
    mB=v.probReal*realMean;
   }
 }
 if(policy==="similarity")weights=model.screen.weights.similarity;
 if(policy==="similarityGain")weights=model.screen.weights.similarityGain;
 if(policy==="jointOls")weights=model.screen.weights.jointOls;
 const wA=weights.A,wB=weights.B;
 const mC=wA*A+(options.cutBC?0:wB*mB);
 return {mB,mC,sourceProbability:originReal,wA,wB,provenanceUsed:policy==="knownSource"?
 "Known-source retrospective oracle":"No digital provenance input",
 predictedTrace:Array.from({length:G5.N},(_,t)=>mC*G5.profile(t))};
}
function benchmark(model,seed=20001,n=4096){
 const cases=G5.cases(seed,n),sums=Object.fromEntries(KEYS.map(k=>[k,0])),
 byMode=Object.fromEntries(["actual","replay","contradiction"].map(k=>[k,{n:0,residual:0,similarity:0,noRelay:0,blind:0,similarityGain:0}]));
 const r=G5.rng(seed+591131);
 for(const x of cases){
  const noise=G6.nuisance(r),base={A:x.A,z:x.z,p:x.p},
   trace=G6.waveform("cable",x.provenance,x.z,noise);
  const input={...base,trace},scores={};
  for(const key of KEYS){
   let inp=input;
   if(key==="swapped")inp={...base,trace:G6.waveform("cable",x.provenance,x.z,noise,true)};
   if(key==="equalized")inp={...base,trace:G6.waveform("equalized",x.provenance,x.z,noise)};
   if(key==="knownSource"||key==="oracle")inp={...base,trace,provenance:x.provenance};
   const policy=key==="swapped"?"residual":key;
   const value=predict(model,inp,policy).mC;
   scores[key]=(x.C-value)**2;
   sums[key]+=scores[key];
  }
  const category=x.provenance;
  for(const group of [category,...(category==="actual"&&x.z!==x.A?["contradiction"]:[])]){
   byMode[group].n++;
   for(const key of ["residual","similarity","noRelay","blind","similarityGain"])
     byMode[group][key]+=scores[key];
  }
 }
 const errors=Object.fromEntries(KEYS.map(k=>[k,sums[k]/n]));
 const conditional=Object.fromEntries(Object.entries(byMode).map(([k,v])=>[k,{
  n:v.n,...Object.fromEntries(["residual","similarity","noRelay","blind","similarityGain"].map(name=>[name,v[name]/v.n]))}]));
 return {seed,n,trainedSeed:model.seed,weights:model.screen.weights,gain:model.screen.gain,
  errors,byMode:conditional,sourceTrainingProbes:model.source.probes,
  note:"All real/replay sources hidden from main inference. Only scoring-reference policies see truth."};
}
function mechanism(model){
 const g=()=>({jitter:0,amp:2.6,noise:Array(G5.N).fill(0)});
 const make=(A,z,source)=>({A,z,p:.95,trace:G6.waveform("cable",source,z,g())});
 const realPositive=make(1,1,"actual"),replayPositive=make(1,1,"replay"),realNegative=make(1,-1,"actual");
 const rp=predict(model,replayPositive),real=predict(model,realPositive),negative=predict(model,realNegative);
 const same={...replayPositive,provenance:"actual",B:-999,C:999,cTrace:Array(G5.N).fill(-100)};
 const poisoned=predict(model,same),cut=predict(model,replayPositive,"residual",{cutBC:true});
 const badHebb=predict(model,realNegative,"similarity");
 const cmp=G5.infer(model.source.relations,{A:1,z:1,p:.95},"blind");
 const checks={
  noTruthOrSourceLeakage:JSON.stringify(rp)===JSON.stringify(poisoned),
  retainedImaginaryB:rp.mB>.25&&rp.mC>.05,
  realReportChangesPosterior:real.mB>rp.mB,
  contradictoryRealBReversesC:negative.mC<0&&rp.mC>0,
  cutPreservesB:cut.mB===rp.mB&&Math.abs(rp.mC-cut.mC-model.screen.weights.residual.B*rp.mB)<1e-12,
  directAResidualSmall:Math.abs(model.screen.weights.residual.A)<.15,
  unknownSourceHasMixedBelief:cmp.mC>G5.infer(model.source.relations,{A:1,z:1,p:.95,provenance:"replay"},"aware").mC
 };
 return {checks,values:{replay:rp,real,contradiction:negative,similarityContradiction:badHebb,cut}};
}
function confirmation(){
 const rows=[];
 for(let i=0;i<12;i++){
  const trainSeed=770001+i,testSeed=870001+i,model=train(trainSeed,512,320);
  const outcome=benchmark(model,testSeed,4096),m=mechanism(model),w=model.screen.weights,e=outcome.errors;
  const checks={
   screened:Math.abs(w.residual.A)<=.15&&Math.abs(w.similarity.A)>=.35,
   relayBenefit:outcome.byMode.replay.noRelay-outcome.byMode.replay.residual>=.06,
   beatSimilarity:e.similarity-e.residual>=.15,
   sourceBenefit:e.blind-e.residual>=.001,
   swappedDamages:e.swapped-e.residual>=.006,
   equalizedControl:Math.abs(e.equalized-e.blind)<=.004,
   mechanisms:Object.values(m.checks).every(Boolean)
  };
  rows.push({trainSeed,testSeed,outcome,mechanism:m,checks});
 }
 const keys=Object.keys(rows[0].checks);
 const counts=Object.fromEntries(keys.map(k=>[k,rows.filter(x=>x.checks[k]).length]));
 const ratio=(arr)=>{const list=arr.slice().sort((x,y)=>x-y);return (list[5]+list[6])/2};
 const policies=Object.keys(rows[0].outcome.errors);
 const medians=Object.fromEntries(policies.map(k=>[k,ratio(rows.map(x=>x.outcome.errors[k]))]));
 const medianDirectAResidual=ratio(rows.map(x=>Math.abs(x.outcome.weights.residual.A)));
 const medianDirectASimilarity=ratio(rows.map(x=>Math.abs(x.outcome.weights.similarity.A)));
 const screeningRatio=medianDirectAResidual/(medianDirectASimilarity||1);
 const passed=counts.screened>=10&&screeningRatio<1/3&&counts.relayBenefit>=10&&counts.beatSimilarity>=10&&
 counts.sourceBenefit>=10&&counts.swappedDamages>=10&&counts.equalizedControl>=10&&counts.mechanisms===12;
 return {protocol:"docs/GATE7_PROTOCOL.md",rows,counts,medians,
  screening:{medianAbsoluteAResidual:medianDirectAResidual,medianAbsoluteASimilarity:medianDirectASimilarity,ratio:screeningRatio},
  passed,scope:"Engineering integration: batch conditional regression, known anatomy, exact inference, known-source waveform calibration; no literal neuron or qualia."};
}
root.Gate7={KEYS,fit,train,predict,benchmark,mechanism,confirmation};
})(typeof globalThis!=="undefined"?globalThis:this);
