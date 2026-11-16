/* QualiaAstra Gate 3: no signed calibration labels. Two raw-sensor prototypes
   are found without labels, then local sensory prediction errors fit B/C wave
   templates as later recordings arrive. Causal chain and two-state bottlenecks
   remain engineered. Requires gate2_engine.js before this file. */
(function buildGate3(root){
 "use strict";
 const G2=root.Gate2;
 if(!G2 || typeof G2.newCase!=="function")throw Error("Load gate2_engine.js before gate3_engine.js");
 const N=G2.N;
 function squaredDistance(a,b){let sum=0;for(let i=0;i<N;i++){const d=a[i]-b[i];sum+=d*d;}return sum;}
 function fitTwoPrototypes(rows,seed){
  const r=G2.rng(seed),n=rows.length;
  if(n<8)throw Error("At least 8 unlabelled examples required");
  const initial=Math.floor(r()*n);let far=0,maxD=-1;
  for(let i=0;i<n;i++){const d=squaredDistance(rows[i],rows[initial]);if(d>maxD){maxD=d;far=i;}}
  let prototypes=[rows[initial].slice(),rows[far].slice()],counts=[0,0];
  for(let pass=0;pass<15;pass++){
   const acc=[Array(N).fill(0),Array(N).fill(0)];counts=[0,0];
   for(const x of rows){const cluster=squaredDistance(x,prototypes[0])<squaredDistance(x,prototypes[1])?0:1;counts[cluster]++;for(let t=0;t<N;t++)acc[cluster][t]+=x[t];}
   for(let k=0;k<2;k++)if(counts[k])prototypes[k]=acc[k].map(v=>v/counts[k]);
  }
  let residual=0;
  for(const x of rows)residual+=Math.min(squaredDistance(x,prototypes[0]),squaredDistance(x,prototypes[1]));
  const variance=Math.max(.0001,residual/(n*N));
  return {prototypes,counts,variance};
 }
 function readout(cluster,x){
  const d0=squaredDistance(x,cluster.prototypes[0]);
  const d1=squaredDistance(x,cluster.prototypes[1]);
  return Math.tanh((d0-d1)/(4*cluster.variance));
 }
 function observedCases(seed,n){
  const r=G2.rng(seed);
  return Array.from({length:n},()=>{
   const c=G2.newCase(r);
   // Deliberately discard all hidden source signs and relation labels.
   return {raw:c.raw,clue:c.q,future:c.withheld};
  });
 }
 function trainFromObserved(examples,seed=1401,options={}){
  if(!Array.isArray(examples)||examples.length<8)throw Error("Need observed calibration episodes");
  for(const x of examples){
   if(!x||!Array.isArray(x.raw)||x.raw.length!==2||x.raw.some(w=>w.length!==N)||
      !Array.isArray(x.future)||x.future.length!==2||x.future.some(w=>w.length!==N)||
      !Number.isFinite(x.clue))throw Error("Each episode needs raw sensors, a clue, and future sensory observations");
  }
  const enc=[0,1].map(k=>fitTwoPrototypes(examples.map(c=>c.raw[k]),seed+k*99));
  const templates=[Array(N).fill(0),Array(N).fill(0)],denominators=[.000000001,.000000001];
  const offset=Math.max(1,Math.floor(examples.length*.37));
  // World is separate from prediction. The local error at each downstream
  // sensor changes only that sensor's decoder template.
  for(let i=0;i<examples.length;i++){
   const c=examples[i],future=examples[options.unpaired?(i+offset)%examples.length:i].future;
   const a=Math.tanh(c.clue);
   const z1=readout(enc[0],c.raw[0]),z2=readout(enc[1],c.raw[1]);
   const states=[a*z1,a*z1*z2];
   for(let k=0;k<2;k++){
    const h=states[k];
    denominators[k]+=h*h;
    const rate=h/denominators[k];
    for(let t=0;t<N;t++){
     const predicted=h*templates[k][t];
     const localPredictionError=future[k][t]-predicted;
     templates[k][t]+=rate*localPredictionError;
    }
   }
  }
  return {seed,n:examples.length,enc,templates,denominators,training:"unlabelled prototypes + local sensory error",unpaired:Boolean(options.unpaired)};
 }
 function train(seed=1401,n=256,options={}){return trainFromObserved(observedCases(seed,n),seed,options);}
 function infer(model,raw,clue=null,mode="learned"){
  if(!["learned","cut","cutBC","reverse","disconnected"].includes(mode))throw Error("Unsupported intervention");
  if(!Array.isArray(raw)||raw.length!==2||raw.some(x=>x.length!==N))throw Error("Expected two raw 48-point sensor traces");
  const a=clue===null?0:Math.tanh(clue);
  const evidence=[readout(model.enc[0],raw[0]),readout(model.enc[1],raw[1])];
  const used=evidence.slice();
  if(mode==="cut"||mode==="disconnected")used[0]=0;
  if(mode==="cutBC"||mode==="disconnected")used[1]=0;
  if(mode==="reverse")used[0]*=-1;
  const b=a*used[0],c=b*used[1];
  return {means:[a,b,c],relations:evidence,usedRelations:used,prediction:[model.templates[0].map(v=>v*b),model.templates[1].map(v=>v*c)]};
 }
 function mse(pred,actual){return G2.mse(pred,actual);}
 function benchmark(model,seed=20261116,n=512){
  const r=G2.rng(seed),cases=Array.from({length:n},()=>G2.newCase(r));
  const labels=["learned","cut","cutBC","disconnected","shuffled","unpaired","supervised"];
  const totals=Object.fromEntries(labels.map(label=>[label,0]));
  const supervised=G2.train(model.seed,model.n);
  const unpaired=train(model.seed,model.n,{unpaired:true});
  const off1=Math.max(1,Math.floor(n*.237)),off2=Math.max(2,Math.floor(n*.451));
  let baseline=0;
  for(let i=0;i<n;i++){
   const c=cases[i];
   baseline+=mse([Array(N).fill(0),Array(N).fill(0)],c.withheld);
   for(const mode of ["learned","cut","cutBC","disconnected"]){
    totals[mode]+=mse(infer(model,c.raw,c.q,mode).prediction,c.withheld);
   }
   const shuffledRaw=[cases[(i+off1)%n].raw[0],cases[(i+off2)%n].raw[1]];
   totals.shuffled+=mse(infer(model,shuffledRaw,c.q).prediction,c.withheld);
   totals.unpaired+=mse(infer(unpaired,c.raw,c.q).prediction,c.withheld);
   totals.supervised+=mse(G2.infer(supervised,c.raw,c.q).prediction,c.withheld);
  }
  return {seed,n,calibration_n:model.n,relativeMSE:Object.fromEntries(labels.map(k=>[k,totals[k]/baseline])),
    note:"The learned model is label-free during training, but receives future waveforms as self-supervised error targets. The supervised baseline receives ground-truth source labels."};
 }
 function confirmation(){
  const rows=[];
  for(let i=0;i<12;i++){
   const s=700101+i,test=880101+i,model=train(s,256);
   const result=benchmark(model,test,512);
   const e=result.relativeMSE;
   const checks={
    primary:e.learned<.80,
    shuffle:e.shuffled-e.learned>=.20,
    unpaired:e.unpaired-e.learned>=.20,
    supervised:e.learned-e.supervised<=.10,
    cut:Math.abs(e.cut-1)<1e-10,
   };
   rows.push({seed:s,testSeed:test,relativeMSE:e,checks});
  }
  const keys=["primary","shuffle","unpaired","supervised","cut"];
  const gates=Object.fromEntries(keys.map(k=>[k,rows.filter(r=>r.checks[k]).length]));
  const median=Object.fromEntries(Object.keys(rows[0].relativeMSE).map(k=>{
   const values=rows.map(x=>x.relativeMSE[k]).sort((a,b)=>a-b);
   return [k,(values[5]+values[6])/2];
  }));
  return {rows,gates,median,pass:gates.primary>=10&&gates.shuffle>=10&&gates.unpaired>=10&&gates.supervised>=10&&gates.cut===12,
   confirmSeeds:"700101..700112",testSeeds:"880101..880112"};
 }
 root.Gate3={N,observedCases,trainFromObserved,train,infer,benchmark,confirmation,mse};
})(typeof globalThis!=="undefined"?globalThis:this);
