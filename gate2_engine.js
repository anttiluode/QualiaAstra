/* Gate 2: raw interference traces -> calibrated relation likelihoods -> withheld wave predictions.
   No source labels or withheld waveforms enter inference. Labels ARE supplied during calibration.
   Exploratory study; old Gate 1 engine and receipts remain unchanged. */
(function buildEngine(root){
  "use strict";
  const N=48,TAU=2*Math.PI;
  function rng(seed){
    let s=seed>>>0;
    return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  }
  function normal(r){return Math.sqrt(-2*Math.log(Math.max(r(),1e-12)))*Math.cos(TAU*r());}
  function sourceProfile(which,t){
    const x=t/N;
    return (which===1?.83:.75)*Math.exp(-2.0*x)*(Math.sin(TAU*((which===1?3.4:4.5)*x)+(which===1?.24:1.1))+
      .34*Math.sin(TAU*((which===1?7.2:8.4)*x)+.2));
  }
  function rawTrace(which,relation,r){
    const gain=Math.max(.35,1+.18*normal(r)),offset=.19*normal(r);
    return Array.from({length:N},(_,t)=>{
      const x=t/N,phase=which===0?.1:.95,env=.60+.4*Math.sin(Math.PI*x);
      const u=.68*env*(Math.sin(TAU*3.2*x+phase)+.18*Math.sin(TAU*6.1*x+.15));
      const v=.68*env*(Math.sin(TAU*3.2*x+phase+.48)+.2*Math.sin(TAU*5.9*x+.35));
      return gain*(u+relation*v)**2+offset+.53*normal(r);
    });
  }
  function newCase(r){
    const signs=Array.from({length:3},()=>r()<.5?-1:1);
    const relation=[signs[0]*signs[1],signs[1]*signs[2]];
    return {signs,relation,q:signs[0]+.88*normal(r),
      raw:[rawTrace(0,relation[0],r),rawTrace(1,relation[1],r)],
      withheld:[1,2].map(which=>Array.from({length:N},(_,t)=>signs[which]*sourceProfile(which,t)+.19*normal(r)))};
  }
  function train(seed=1401,n=256){
    const r=rng(seed),cases=Array.from({length:n},()=>newCase(r));
    const mean=Array.from({length:2},()=>[Array(N).fill(0),Array(N).fill(0)]);
    const count=Array.from({length:2},()=>[0,0]);
    const template=[Array(N).fill(0),Array(N).fill(0)];
    let qPlus=0,qMinus=0,nPlus=0,nMinus=0;
    for(const c of cases){
      const labelQ=c.signs[0]>0;
      if(labelQ){qPlus+=c.q;nPlus++;}else{qMinus+=c.q;nMinus++;}
      for(let k=0;k<2;k++){
        const cls=c.relation[k]>0?1:0;
        count[k][cls]++;
        for(let t=0;t<N;t++){mean[k][cls][t]+=c.raw[k][t];template[k][t]+=c.signs[k+1]*c.withheld[k][t];}
      }
    }
    for(let k=0;k<2;k++){
      for(let cls=0;cls<2;cls++) for(let t=0;t<N;t++)mean[k][cls][t]/=count[k][cls];
      for(let t=0;t<N;t++)template[k][t]/=n;
    }
    const variance=[0,0];
    for(const c of cases){
      for(let k=0;k<2;k++){
        const mu=mean[k][c.relation[k]>0?1:0];
        for(let t=0;t<N;t++) variance[k]+=(c.raw[k][t]-mu[t])**2;
      }
    }
    for(let k=0;k<2;k++)variance[k]=Math.max(1e-4,variance[k]/(n*N));
    const mu=[qMinus/nMinus,qPlus/nPlus];
    let qVar=0;
    for(const c of cases)qVar+=(c.q-mu[c.signs[0]>0?1:0])**2;
    qVar=Math.max(1e-4,qVar/n);
    return {seed,n,N,means:mean,variance,templates:template,qMu:mu,qVar,counts:count};
  }
  function relationEvidence(model,trace,k){
    let ssPlus=0,ssMinus=0;
    for(let t=0;t<N;t++){
      ssPlus+=(trace[t]-model.means[k][1][t])**2;
      ssMinus+=(trace[t]-model.means[k][0][t])**2;
    }
    const logOdds=(ssMinus-ssPlus)/(2*model.variance[k]);
    return Math.tanh(logOdds/2);
  }
  function infer(model,raw,q,mode="learned",oracleRelations=null){
    if(!["learned","cut","reverse","disconnected","oracle"].includes(mode))throw Error("Unknown mode");
    if(raw.length!==2||raw.some(x=>x.length!==N))throw Error("Expected two 48-sample raw sensor traces");
    const h=q===null?0:((q-model.qMu[0])**2-(q-model.qMu[1])**2)/(4*model.qVar);
    const a=Math.tanh(h),e=raw.map((x,k)=>relationEvidence(model,x,k));
    let ab=e[0],bc=e[1];
    if(mode==="oracle"){
      if(!oracleRelations)throw Error("Oracle is an evaluation-only control and requires hidden labels");
      ab=oracleRelations[0];bc=oracleRelations[1];
    }
    if(mode==="cut"||mode==="disconnected")ab=0;
    if(mode==="disconnected")bc=0;
    if(mode==="reverse")ab=-ab;
    const means=[a,a*ab,a*ab*bc];
    return {means,relations:e,usedRelations:[ab,bc],prediction:means.slice(1).map((m,k)=>model.templates[k].map(v=>v*m))};
  }
  function mse(pred,actual){
    let ss=0;
    for(let k=0;k<2;k++)for(let t=0;t<N;t++)ss+=(pred[k][t]-actual[k][t])**2;
    return ss;
  }
  function benchmark(model,seed=20261116,n=512){
    const r=rng(seed),cases=Array.from({length:n},()=>newCase(r));
    const modes=["learned","cut","disconnected","oracle","shuffled"];
    const totals=Object.fromEntries(modes.map(x=>[x,0]));
    let zero=0,correct=[0,0],count=0;
    const seeded=rng(seed+113);
    const offsets=[1+Math.floor(seeded()*(n-1)),1+Math.floor(seeded()*(n-1))];
    for(let i=0;i<n;i++){
      const c=cases[i];
      zero+=mse([Array(N).fill(0),Array(N).fill(0)],c.withheld);
      for(const mode of modes){
        const raw=mode==="shuffled"?
          [cases[(i+offsets[0])%n].raw[0],cases[(i+offsets[1])%n].raw[1]]:c.raw;
        const out=infer(model,raw,c.q,mode==="shuffled"?"learned":mode,mode==="oracle"?c.relation:null);
        totals[mode]+=mse(out.prediction,c.withheld);
        if(mode==="learned"){
          count++;
          for(let j=0;j<2;j++)if(Math.sign(out.means[j+1])===c.signs[j+1])correct[j]++;
        }
      }
    }
    return {seed,n,calibration_n:model.n,relativeMSE:Object.fromEntries(modes.map(m=>[m,totals[m]/zero])),signAccuracy:correct.map(x=>x/count),baseline:"zero withheld waveform",note:"Development benchmark, not a preregistered or held-out scientific confirmation."};
  }
  root.Gate2={N,rng,newCase,train,infer,benchmark,mse};
})(typeof globalThis!=='undefined'?globalThis:this);
