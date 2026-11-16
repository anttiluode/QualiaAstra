/* QualiaAstra Gate 6 — Physical-like wave signatures without a provenance bit.
   Depends on gate5_engine.js for the SIGNED-EVENT Markov generator ONLY.
   At inference, decoder takes A,z,p,rawTrace; no provenance or truth input.
   Calibration DOES know the isolated source of each probe.
   Synthetic cable/spike kernels are not validated biological equations. */
(function(root){"use strict";
const G5=root.Gate5;if(!G5)throw Error("Load gate5_engine.js before gate6_engine.js");
const N=48,MODES=["cable","spike","combined","equalized"];
const SPECS={cable:[[1.3,6.2],[2.9,10.6]],
 spike:[[1.2,7.2],[1.8,8.4]],
 combined:[[1.2,6.8],[2.6,9.8]],
 equalized:[[1.85,8.4],[1.85,8.4]]};
const RHO=G5.RHO;
function raw(t,rise,decay,jitter=0){
const x=t-4-jitter;if(x<=0)return 0;
return (1-Math.exp(-x/rise))*Math.exp(-x/decay)-
 .14*(1-Math.exp(-x/(rise*1.7)))*Math.exp(-x/(decay*2.0));
}
function shape(mode,source,jitter=0){
if(!MODES.includes(mode))throw Error("Unknown physical condition "+mode);
if(mode==="combined"){const c=shape("cable",source,jitter),p=shape("spike",source,jitter);const mixed=c.map((v,i)=>.6*v+.4*p[i]);const magnitude=Math.hypot(...mixed);return mixed.map(v=>v/magnitude);}
const pair=SPECS[mode][source==="actual"?0:source==="replay"?1:-1];if(!pair)throw Error("Unknown stimulus origin");
const v=Array.from({length:N},(_,t)=>raw(t,pair[0],pair[1],jitter));
const power=Math.hypot(...v);return v.map(x=>x/power);
}
function nuisance(r){
return {jitter:Math.floor(r()*3)-1,amp:2.6*(.86+.28*r()),
 noise:Array.from({length:N},()=>.19*G5.normal(r))};
}
function waveform(mode,source,z,n,swap=false){
if(z!==1&&z!==-1)throw Error("Signal must be a signed event");
const which=swap?(source==="actual"?"replay":"actual"):source;
const s=shape(mode,which,n.jitter);
return s.map((v,t)=>z*n.amp*v+n.noise[t]);
}
function dot(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;}
function features(trace,z,kind="shape"){
if(!Array.isArray(trace)||trace.length!==N||trace.some(x=>!Number.isFinite(x)))throw Error("Raw 48-sample waveform required");
if(kind==="energy")return [dot(trace,trace)];
return trace.map(v=>v*z);
}
function fit(probes,kind="shape"){
const K=kind==="energy"?1:N,muA=Array(K).fill(0),muR=Array(K).fill(0);
const groups={actual:[],replay:[]};
for(const sample of probes){
const v=features(sample.trace,sample.z,kind);groups[sample.source].push(v);
const mu=sample.source==="actual"?muA:muR;
for(let j=0;j<K;j++)mu[j]+=v[j];
}
const ca=groups.actual.length,cr=groups.replay.length;
if(ca<20||cr<20)throw Error("Insufficient separated stimulation probes");
for(let j=0;j<K;j++){muA[j]/=ca;muR[j]/=cr;}
const d=muA.map((x,j)=>x-muR[j]),mid=muA.map((x,j)=>(x+muR[j])/2),signal=dot(d,d);
let variance=0;
for(const source of ["actual","replay"]){
for(const v of groups[source]){
const center=source==="actual"?muA:muR;
const err=dot(v,d)-dot(center,d);
variance+=err*err;
}}
variance=Math.max(1e-8,variance/(ca+cr));
return {kind,muA,muR,d,mid,signal,variance,calibrationCounts:[ca,cr]};
}
function logRatio(decoder,trace,z){
const x=features(trace,z,decoder.kind);
return Math.max(-25,Math.min(25,dot(x.map((v,i)=>v-decoder.mid[i]),decoder.d)*decoder.signal/decoder.variance));
}
function calibrate(seed,mode,n=320,kind="shape"){
const r=G5.rng(seed),probes=[];
for(const source of ["actual","replay"])for(let i=0;i<n;i++){
const z=r()<.5?-1:1;
probes.push({source,z,trace:waveform(mode,source,z,nuisance(r))});
}
return fit(probes,kind);
}
function train(seed=17001,observations=512,probes=320){
const relations=G5.train(seed,observations);
const decoders={};
for(let k=0;k<MODES.length;k++){
const mode=MODES[k];
decoders[mode]=calibrate(seed+200031+101*k,mode,probes);
}
decoders.energy=calibrate(seed+200031,"cable",probes,"energy");
return {seed,observations,probes,relations,decoders,
note:"Source known ONLY for isolated calibration probes; online inference receives a waveform and no origin tag."};
}
function infer(model,report,mode="cable",options={}){
const {A,z,p,trace}=report;
if((A!==1&&A!==-1)||(z!==1&&z!==-1)||!Number.isFinite(p)||p<.5||p>1)throw Error("Bad observed A/z/p");
const decoder=model.decoders[mode];if(!decoder)throw Error("Uncalibrated physical mode");
const LR=logRatio(decoder,trace,z);
const rho1=model.relations.rho1,rho2=model.relations.rho2,k=2*p-1;
const prior=rho1*A,observed=(prior+k*z)/(1+prior*k*z);
const lReal=(1+A*z*rho1*k)/2;
const lReplay=z===A?1:0;
const odds=lReplay===0?1:1/(1+(lReplay/lReal)*Math.exp(-LR));
const mB=odds*observed+(1-odds)*prior,mC=options.cutBC?0:rho2*mB;
return {mPriorB:prior,mB,mC,probReal:odds,shapeLogLikelihood:LR,
cPrediction:Array.from({length:N},(_,t)=>mC*G5.profile(t)),
note:"No truth or provenance is accessed at inference; the physical waveform provides a likelihood."};
}
function evaluate(model,seed=20001,n=4096){
const truth=G5.cases(seed,n),names=["cable","spike","combined","equalized","energy","swapped","blind","oracle","naive"];
const total=Object.fromEntries(names.map(k=>[k,0]));
const ambiguous=Object.fromEntries(names.map(k=>[k,0]));
const labelStats=Object.fromEntries(["cable","spike","combined","equalized","energy","swapped"].map(k=>[k,{correct:0,n:0,ambiguousCorrect:0,ambiguousN:0}]));
let ambiguousN=0;
for(let i=0;i<n;i++){
const c=truth[i],report={A:c.A,z:c.z,p:c.p};
const r=G5.rng((seed+17+i*15791)>>>0),params=nuisance(r);
const wave={};
for(const mode of MODES)wave[mode]=waveform(mode,c.provenance,c.z,params);
wave.swapped=waveform("cable",c.provenance,c.z,params,true);
wave.energy=wave.cable;
const estimates={};
for(const mode of ["cable","spike","combined","equalized","energy","swapped"]){
const decoderMode=mode==="swapped"?"cable":mode;
const estimated=infer(model,{...report,trace:wave[mode]},decoderMode);
estimates[mode]=estimated.mC;
const stat=labelStats[mode],correct=(estimated.probReal>.5)===(c.provenance==="actual");
stat.n++;if(correct)stat.correct++;
if(c.z===c.A){stat.ambiguousN++;if(correct)stat.ambiguousCorrect++;}
}
estimates.blind=G5.infer(model.relations,report,"blind").mC;
estimates.naive=G5.infer(model.relations,report,"naive").mC;
estimates.oracle=G5.infer(model.relations,{...report,provenance:c.provenance},"aware").mC;
if(c.z===c.A)ambiguousN++;
for(const key of names){
const e=(estimates[key]-c.C)**2;
total[key]+=e;
if(c.z===c.A)ambiguous[key]+=e;
}
}
return {seed,n,trainSeed:model.seed,trainedEpisodes:model.observations,calibrationProbesPerSource:model.probes,
mse:Object.fromEntries(names.map(k=>[k,total[k]/n])),
ambiguousMse:Object.fromEntries(names.map(k=>[k,ambiguous[k]/ambiguousN])),
ambiguousN,
sourceAccuracy:Object.fromEntries(Object.entries(labelStats).map(([name,s])=>[name,{all:s.correct/s.n,
ambiguous:s.ambiguousCorrect/s.ambiguousN,nAmbiguous:s.ambiguousN}])),
note:"No per-trial provenance supplied to physical decoder; oracle alone uses truth after scoring."};
}
function mechanism(model){
const A=1,z=1,p=.95,n={jitter:0,amp:2.15,noise:Array(N).fill(0)};
const actual=infer(model,{A,z,p,trace:waveform("cable","actual",z,n)},"cable");
const replay=infer(model,{A,z,p,trace:waveform("cable","replay",z,n)},"cable");
const same={A,z,p,trace:waveform("cable","replay",z,n)};
const poisoned={...same,provenance:"actual",B:-99,C:99,cTrace:Array(N).fill(999)};
const cut=infer(model,same,"cable",{cutBC:true});
const altered=infer(model,{...same,trace:waveform("cable","actual",z,n)},"cable");
const fake={...same,provenance:"replay",B:999,C:-999};
const blind=G5.infer(model.relations,{A,z,p},"blind");
const checks={
 waveformDiscriminates:actual.probReal>replay.probReal+.3,
 noTruthOrTagLeakage:JSON.stringify(infer(model,same))===JSON.stringify(infer(model,poisoned))&&
 JSON.stringify(infer(model,same))===JSON.stringify(infer(model,fake)),
 waveformChangesOutcome:altered.mC>replay.mC,
 cutPreservesB:cut.mC===0&&cut.mB===replay.mB,
 heldPredictionNonzero:replay.mB!==0&&replay.mC!==0,
 probabilityBounded:actual.probReal>=0&&actual.probReal<=1&&replay.probReal>=0&&replay.probReal<=1,
 noTagIsStatisticallyAmbiguous:blind.mC>G5.infer(model.relations,{A,z,p,provenance:"replay"},"aware").mC&&
 blind.mC<G5.infer(model.relations,{A,z,p,provenance:"actual"},"aware").mC
};
return {checks,values:{pRealActualWave:actual.probReal,pRealReplayWave:replay.probReal,
 CFromActualShape:actual.mC,CFromReplayShape:replay.mC,CWithoutShape:blind.mC}};
}
function confirmation(){
const rows=[];
for(let i=0;i<12;i++){
const trainSeed=760001+i,testSeed=860001+i,model=train(trainSeed,512,320);
const result=evaluate(model,testSeed,4096),m=mechanism(model),s=result.mse;
const checks={
 cableBeatsBlind:s.blind-s.cable>=.0015,
 cableBeatsEnergy:s.energy-s.cable>=.0015,
 nullNearBlind:Math.abs(s.equalized-s.blind)<=.004,
 swapDamages:s.swapped-s.cable>=.006,
 spikeShapeContainsSignal:result.sourceAccuracy.spike.ambiguous>=.63,
 mechanism:Object.values(m.checks).every(Boolean)
};
rows.push({trainSeed,testSeed,result,mechanism:m,checks});
}
const keys=["cableBeatsBlind","cableBeatsEnergy","nullNearBlind","swapDamages","spikeShapeContainsSignal","mechanism"];
const counts=Object.fromEntries(keys.map(k=>[k,rows.filter(row=>row.checks[k]).length]));
const medians=Object.fromEntries(Object.keys(rows[0].result.mse).map(k=>{
const sorted=rows.map(row=>row.result.mse[k]).sort((a,b)=>a-b);return [k,(sorted[5]+sorted[6])/2];}));
return {protocol:"docs/GATE6_PROTOCOL.md",rows,counts,medians,passed:keys.every(k=>counts[k]>=(k==="mechanism"?12:10)),
scope:"Waveform source signature is engineered and calibration probes have known origins, but individual test packets contain only A,z,p and noisy waveforms. No biological claim."};
}
root.Gate6={N,MODES,SPECS,shape,nuisance,waveform,features,fit,logRatio,calibrate,train,infer,evaluate,mechanism,confirmation};
})(typeof globalThis!=="undefined"?globalThis:this);
