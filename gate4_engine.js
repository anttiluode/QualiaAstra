/* Gate 4 — freely competing delayed links with matched two-edge budgets.
   Development on seeds 4001..4005 precedes frozen protocol in docs/GATE4_PROTOCOL.md.
   A held prediction is replayed downstream independently of the residual.
   Synthetic proxy only: not literal dendritic cable physics or spike simulation. */
(function(root){
"use strict";
const N=4,T=26,DELAYS=12,BUDGET=2,NAMES=["A","B","C","D"];
function rng(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function randn(r){return Math.sqrt(-2*Math.log(Math.max(1e-12,r())))*Math.cos(2*Math.PI*r());}
function pulse(x){return x<0?0:Math.exp(-.42*x)*(Math.cos(1.02*x)+.2*Math.sin(1.02*x));}
function trial(r){
const a=r()<.5?-1:1,b=.85*a+.50*randn(r),c=.92*b+.28*randn(r),d=randn(r);
const amps=[a,b,c,d],times=[2,7,12,7];
return {world:amps.map((v,k)=>Array.from({length:T},(_,t)=>v*pulse(t-times[k])+.055*randn(r))),amps};
}
function cases(seed,n){const r=rng(seed);return Array.from({length:n},()=>trial(r));}
function line(source,t,delay){return .72*(source[t-delay]||0)+.20*(source[t-delay-1]||0)+.08*(source[t-delay-2]||0);}
const candidates=[];
for(let dst=0;dst<N;dst++)for(let src=0;src<N;src++)if(src!==dst)for(let delay=1;delay<=DELAYS;delay++)candidates.push({src,dst,delay});
function train(seed=4001,n=160,method="residual",budget=BUDGET){
if(!["residual","hebb","coactivity","oracle","dead"].includes(method))throw Error("Bad learning condition");
if(!Number.isInteger(budget)||budget<0||budget>12)throw Error("Bad edge budget");
const eps=1e-12,data=cases(seed,n),nodes=data.map(c=>c.world);
const targetPower=Array(N).fill(0);
for(const w of nodes)for(let j=1;j<N;j++)for(const v of w[j])targetPower[j]+=v*v;
let chosen=[],values=[];
if(method==="dead")return {seed,n,method,budget,edges:[]};
const stats=candidates.filter(c=>c.dst!==0).map(e=>{
let dot=0,norm=0,co=0;
for(const w of nodes)for(let t=0;t<T;t++){
const x=line(w[e.src],t,e.delay),y=w[e.dst][t];dot+=x*y;norm+=x*x;co+=Math.abs(x*y);
}
return {...e,dot,norm,co,score:dot*dot/(Math.max(eps,norm)*Math.max(eps,targetPower[e.dst])),
coscore:co/Math.sqrt(Math.max(eps,norm)*Math.max(eps,targetPower[e.dst]))};
});
if(method==="oracle"){chosen=[{src:0,dst:1,delay:5},{src:1,dst:2,delay:5}];}
else if(method==="hebb"||method==="coactivity"){
const ranked=stats.slice().sort((a,b)=>method==="hebb"?b.score-a.score:b.coscore-a.coscore);
for(const e of ranked){
if(chosen.length===budget)break;
if(chosen.some(x=>x.src===e.src&&x.dst===e.dst))continue;
chosen.push({src:e.src,dst:e.dst,delay:e.delay});
}
}else{
const residuals=nodes.map(w=>w.map(v=>v.slice()));
for(let step=0;step<budget;step++){
let best=null,gain=-Infinity;
for(const e of stats){
if(chosen.some(x=>x.src===e.src&&x.dst===e.dst))continue;
let g=0;
for(let i=0;i<nodes.length;i++)for(let t=0;t<T;t++)g+=line(nodes[i][e.src],t,e.delay)*residuals[i][e.dst][t];
const score=g*g/(Math.max(eps,e.norm)*Math.max(eps,targetPower[e.dst]));
if(score>gain){best=e;gain=score;}
}
chosen.push({src:best.src,dst:best.dst,delay:best.delay});
// Locally useful conditional residual reduction; existing chosen links are jointly refit.
for(let iter=0;iter<6;iter++)for(let k=0;k<chosen.length;k++){
const e=chosen[k];let xy=0,xx=0;
for(const w of nodes)for(let t=0;t<T;t++){
const x=line(w[e.src],t,e.delay);xx+=x*x;let y=w[e.dst][t];
for(let h=0;h<chosen.length;h++)if(h!==k&&chosen[h].dst===e.dst)y-=(values[h]||0)*line(w[chosen[h].src],t,chosen[h].delay);
xy+=x*y;
}
values[k]=xy/(xx+.001);
}
for(let i=0;i<nodes.length;i++)for(let j=1;j<N;j++)for(let t=0;t<T;t++){
let predicted=0;
for(let k=0;k<chosen.length;k++)if(chosen[k].dst===j)predicted+=(values[k]||0)*line(nodes[i][chosen[k].src],t,chosen[k].delay);
residuals[i][j][t]=nodes[i][j][t]-predicted;
}
}
}
if(method!=="residual")for(let iter=0;iter<8;iter++)for(let k=0;k<chosen.length;k++){
const e=chosen[k];let xy=0,xx=0;
for(const w of nodes)for(let t=0;t<T;t++){
const x=line(w[e.src],t,e.delay);xx+=x*x;let y=w[e.dst][t];
for(let h=0;h<chosen.length;h++)if(h!==k&&chosen[h].dst===e.dst)y-=(values[h]||0)*line(w[chosen[h].src],t,chosen[h].delay);
xy+=x*y;
}
values[k]=xy/(xx+.001);
}
return {seed,n,method,budget,edges:chosen.map((e,k)=>({...e,weight:values[k]}))};
}
function replay(model,world,options={}){
const pred=Array.from({length:N},()=>Array(T).fill(0));
pred[0]=world[0].slice();
for(let t=0;t<T;t++)for(const dst of [1,2,3]){
if(options.showB&&dst===1){pred[1][t]=world[1][t];continue;}
let v=0;
for(const e of model.edges)if(e.dst===dst){
if(options.cut==="AB"&&e.src===0&&e.dst===1)continue;
if(options.cut==="BC"&&e.src===1&&e.dst===2)continue;
v+=e.weight*line(pred[e.src],t,e.delay);
}
pred[dst][t]=v;
}
const residue=pred.map((row,j)=>row.map((v,t)=>world[j][t]-v));
return {pred,residue,world};
}
function evaluate(model,seed=9001,n=256){
const data=cases(seed,n);let sse=0,zero=0,surprise=0,baselineSurprise=0,predEnergy=0;
for(const d of data){
const q=replay(model,d.world);
for(let j=1;j<3;j++)for(let t=0;t<T;t++){
const y=d.world[j][t],p=q.pred[j][t],res=y-p;
sse+=res*res;zero+=y*y;predEnergy+=p*p;
if(Math.abs(res)>.22)surprise++;
if(Math.abs(y)>.22)baselineSurprise++;
}}
return {error:sse/zero,surpriseRate:surprise/(n*2*T),
baselineSurpriseRate:baselineSurprise/(n*2*T),heldPredictionEnergy:predEnergy/(n*2*T)};
}
function benchmark(seed=4001,n=160,testSeed=9001,testN=256){
const methods=["residual","hebb","coactivity","oracle","dead"];
const models=Object.fromEntries(methods.map(m=>[m,train(seed,n,m)]));
const metrics=Object.fromEntries(methods.map(m=>[m,evaluate(models[m],testSeed,testN)]));
const trueEdges=models.residual.edges.filter(e=>(e.src===0&&e.dst===1)||(e.src===1&&e.dst===2));
const rightDelays=trueEdges.filter(e=>e.delay===5);
return {seed,n,testSeed,testN,models,metrics,
correctEdges:trueEdges.length,correctDelays:rightDelays.length,
description:"Synthetic 4-channel time-lagged waves; all candidate cables supplied, but no fixed connections."};
}
function confirmation(){
const rows=[];
for(let k=0;k<12;k++)rows.push(benchmark(740001+k,160,840001+k,256));
const checks={route:0,accuracy:0,residualAdvantage:0,dead:0,cut:0};
for(const row of rows){
const e=row.metrics;
if(row.correctEdges===2&&row.correctDelays===2)checks.route++;
if(e.residual.error<.60)checks.accuracy++;
if(e.hebb.error-e.residual.error>=.05&&e.coactivity.error-e.residual.error>=.05)checks.residualAdvantage++;
if(Math.abs(e.dead.error-1)<1e-12)checks.dead++;
const d=cases(row.testSeed,1)[0],normal=replay(row.models.residual,d.world),cut=replay(row.models.residual,d.world,{cut:"BC"});
if(cut.pred[1].every((v,i)=>Math.abs(v-normal.pred[1][i])<1e-12)&&cut.pred[2].every(v=>Math.abs(v)<1e-12))checks.cut++;
}
const keys=["residual","hebb","coactivity","oracle","dead"];
const medians=Object.fromEntries(keys.map(k=>{
const s=rows.map(x=>x.metrics[k].error).sort((a,b)=>a-b);return [k,(s[5]+s[6])/2];
}));
return {rows,checks,medians,
H1:checks.route>=10&&checks.accuracy>=10&&checks.dead===12&&checks.cut===12,
H2:checks.residualAdvantage>=10,
note:"The two hypotheses are independent. Do not misrepresent a tie as a win for residual-specific learning."};
}
root.Gate4={N,T,NAMES,DELAYS,BUDGET,rng,trial,cases,train,replay,evaluate,benchmark,confirmation};
})(typeof globalThis!=="undefined"?globalThis:this);
