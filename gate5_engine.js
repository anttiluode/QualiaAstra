/* QualiaAstra Gate 5: Evidence versus Echo.
 * Designed after Gate 4; frozen protocol in docs/GATE5_PROTOCOL.md.
 * This deliberately isolates information provenance: the Markov structure,
 * Bayesian update and provenance tag are supplied, not discovered.
 */
(function(root){"use strict";
const COPY=.85,RHO=2*COPY-1,RELIABILITIES=[.55,.70,.85,.95],C_TAU=2*Math.PI,N=48;
function rng(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function normal(r){return Math.sqrt(-2*Math.log(Math.max(r(),1e-12)))*Math.cos(C_TAU*r());}
function profile(t){const x=t/N;return .90*Math.exp(-1.8*x)*(Math.sin(C_TAU*3.7*x+.5)+.28*Math.sin(C_TAU*7.1*x+.1));}
function newCase(r){
const A=r()<.5?-1:1, B=A*(r()<COPY?1:-1), C=B*(r()<COPY?1:-1);
const p=RELIABILITIES[Math.floor(r()*RELIABILITIES.length)];
const provenance=r()<.5?"actual":"replay";
const z=provenance==="actual"?(r()<p?B:-B):A;
const cTrace=Array.from({length:N},(_,t)=>C*profile(t)+.15*normal(r));
return {A,B,C,p,z,provenance,cTrace};
}
function cases(seed,n){const r=rng(seed);return Array.from({length:n},()=>newCase(r));}
function train(seed=17001,n=512){
if(!Number.isInteger(n)||n<20)throw Error("Calibration requires 20+ observed episodes");
const observed=cases(seed,n);let ab=0,bc=0;
for(const c of observed){ab+=c.A*c.B;bc+=c.B*c.C;}
return {seed,n,rho1:Math.max(-.98,Math.min(.98,ab/n)),rho2:Math.max(-.98,Math.min(.98,bc/n)),
calibration:"Full observed A/B/C traces, no supplied true transition probabilities"};
}
function update(m,z,k){return (m+k*z)/(1+m*k*z);}
function infer(model,observation,strategy="aware",options={}){
if(!["aware","naive","blind","oracle","ignore","cut"].includes(strategy))throw Error("Unknown prediction strategy");
const {A,z,p,provenance}=observation;
if((A!==1&&A!==-1)||(z!==1&&z!==-1)||!Number.isFinite(p)||p<.5||p>1)throw Error("Invalid observation");
if((strategy==="aware"||strategy==="oracle"||strategy==="cut")&&!["actual","replay"].includes(provenance))throw Error("Provenance required for evidence-aware inference");
const rho1=strategy==="oracle"?RHO:model.rho1,rho2=strategy==="oracle"?RHO:model.rho2;
const prior=rho1*A,k=2*p-1,seen=update(prior,z,k);
let posterior=prior,probActual=null;
if(strategy==="aware"||strategy==="oracle"||strategy==="cut"){
if(provenance==="actual")posterior=seen;
if(provenance==="replay")posterior=prior;
}else if(strategy==="naive"){
posterior=prior;
const copies=options.copies===undefined?1:options.copies;
if(!Number.isInteger(copies)||copies<0||copies>30)throw Error("Invalid duplicate count");
for(let i=0;i<copies;i++)posterior=update(posterior,z,k);
}else if(strategy==="blind"){
if(z!==A){posterior=seen;probActual=1;}
else{
const probabilityZGivenActual=(1+rho1*k)/2,probabilityZGivenReplay=1;
probActual=probabilityZGivenActual/(probabilityZGivenActual+probabilityZGivenReplay);
posterior=probActual*seen+(1-probActual)*prior;
}
}
const mC=strategy==="cut"?0:rho2*posterior;
return {mA:A,mPriorB:prior,mB:posterior,mC,actualProbability:probActual,
cPrediction:Array.from({length:N},(_,t)=>mC*profile(t)),status:strategy==="naive"?"Treat every copy as independent":strategy==="blind"?"Marginalize unknown provenance":"Retain origin distinction"};
}
function squaredError(m,truth){return (m-truth)*(m-truth);}
function waveError(pred,truth){let s=0;for(let t=0;t<N;t++){const d=pred[t]-truth[t];s+=d*d;}return s;}
function benchmark(model,seed=20001,n=4096){
const data=cases(seed,n),names=["aware","naive","blind","oracle","ignore","cut","shuffledTag"];
const sums=Object.fromEntries(names.map(name=>[name,0]));
const byMode={actual:{n:0,aware:0,naive:0,blind:0},replay:{n:0,aware:0,naive:0,blind:0}};
const offset=Math.max(1,Math.floor(n*.2434));
let waveZero=0,waveAware=0;
for(let i=0;i<n;i++){
const c=data[i],msg={A:c.A,z:c.z,p:c.p,provenance:c.provenance},scrambled={...msg,provenance:data[(i+offset)%n].provenance};
for(const name of names){
const m=infer(model,name==="shuffledTag"?scrambled:msg,name==="shuffledTag"?"aware":name);
const err=squaredError(m.mC,c.C);
sums[name]+=err;
if(name==="aware"||name==="blind"||name==="naive")byMode[c.provenance][name]+=err;
if(name==="aware"){waveAware+=waveError(m.cPrediction,c.cTrace);}
}
for(const v of c.cTrace)waveZero+=v*v;
byMode[c.provenance].n++;
}
return {seed,n,calibration_n:model.n,rho:[model.rho1,model.rho2],
relativeCError:Object.fromEntries(names.map(name=>[name,sums[name]/n])),
waveformCError:{aware:waveAware/waveZero,zero:1},
byMode:Object.fromEntries(Object.entries(byMode).map(([mode,e])=>[mode,{n:e.n,aware:e.aware/e.n,naive:e.naive/e.n,blind:e.blind/e.n}])),
note:"C is signed ground truth scored only after inference; cTrace is never an inference input."};
}
function mechanism(model){
const same={A:1,z:1,p:.95,provenance:"replay"},genuine={...same,provenance:"actual"};
const replay=infer(model,same),actual=infer(model,genuine),fiveCopies=infer(model,same,"aware",{copies:5});
const naiveOnce=infer(model,same,"naive"),naiveFive=infer(model,same,"naive",{copies:5});
const conflicting={...genuine,z:-1},negative=infer(model,conflicting),negativeReplay=infer(model,{...conflicting,provenance:"replay"});
const cut=infer(model,genuine,"cut");
const blind=infer(model,same,"blind");
const corrupted={...same,B:-999,C:999,cTrace:Array(N).fill(999)};
const purity=JSON.stringify(infer(model,same))===JSON.stringify(infer(model,corrupted));
const checks={
  noSelfConfirmation:replay.mB===fiveCopies.mB&&replay.mC===fiveCopies.mC,
  naiveFalseConfidence:Math.abs(naiveFive.mB)>Math.abs(naiveOnce.mB)&&Math.abs(naiveOnce.mB)>Math.abs(replay.mB),
  actualRevises:actual.mC>replay.mC&&negative.mC<0&&negativeReplay.mC>0,
  cutPreservesB:cut.mC===0&&cut.mB===actual.mB,
  indistinguishableInput:actual.mC!==replay.mC&&blind.mC!==actual.mC&&blind.mC!==replay.mC,
  truthIsHidden:purity
};
return {checks,values:{replayB:replay.mB,replayC:replay.mC,actualC:actual.mC,contradictoryActualC:negative.mC,
naiveFiveB:naiveFive.mB,blindC:blind.mC}};
}
function confirmation(){
const rows=[];
for(let i=0;i<12;i++){
const calibrationSeed=750001+i,testSeed=850001+i,model=train(calibrationSeed,512);
const result=benchmark(model,testSeed,4096),m=mechanism(model),e=result.relativeCError;
const checks={
nearOracle:Math.abs(e.aware-e.oracle)<=.020,
beatNaive:e.naive-e.aware>=.005,
beatBlind:e.blind-e.aware>=.001,
tagMatters:e.shuffledTag-e.aware>=.010,
mechanism:Object.values(m.checks).every(Boolean)};
rows.push({calibrationSeed,testSeed,result,mechanism:m,checks});
}
const keys=["nearOracle","beatNaive","beatBlind","tagMatters","mechanism"];
const counts=Object.fromEntries(keys.map(k=>[k,rows.filter(r=>r.checks[k]).length]));
const modes=Object.keys(rows[0].result.relativeCError);
const medians=Object.fromEntries(modes.map(mode=>{
const x=rows.map(r=>r.result.relativeCError[mode]).sort((a,b)=>a-b);return [mode,(x[5]+x[6])/2];}));
return {protocol:"docs/GATE5_PROTOCOL.md",rows,counts,medians,
passed:counts.nearOracle>=10&&counts.beatNaive>=10&&counts.beatBlind>=10&&counts.tagMatters>=10&&counts.mechanism===12,
interpretation:"Origin-aware Bayes beats a provenance-removed information bound; provenance itself is supplied, not learned."};
}
root.Gate5={N,COPY,RHO,RELIABILITIES,rng,normal,profile,newCase,cases,train,infer,benchmark,mechanism,confirmation};
})(typeof globalThis!=="undefined"?globalThis:this);
