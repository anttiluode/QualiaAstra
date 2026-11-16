/* Closed-form sum-product for this symmetric binary chain. Python parity tested.
   Removing an output contribution happens in the renderer, never in inference. */
(function(root){
  const worlds=[];
  for(const a of [-1,1])for(const b of [-1,1])for(const c of [-1,1])worlds.push([a,b,c]);
  function infer(model,r,q=null,mode='shared'){
    if(!['shared','cut','reverse','uniform','independent'].includes(mode))throw Error('Unknown intervention');
    if(r.length!==2||!r.every(Number.isFinite)||(q!==null&&!Number.isFinite(q)))throw Error('Invalid evidence');
    const h=q===null?0:q*model.local_mu/(model.local_sd**2);
    const evidenceJ=r.map((v,i)=>v*model.relation_mu[i]/(model.relation_sd[i]**2));
    let j=evidenceJ.slice();
    if(['cut','uniform','independent'].includes(mode))j[0]=0;
    if(mode==='independent')j[1]=0;
    if(mode==='reverse')j[0]*=-1;
    const a=Math.tanh(h),b=a*Math.tanh(j[0]),c=b*Math.tanh(j[1]);
    // Directed message edits generally do not define a unique joint posterior.
    // Keep a separately named, unmodified evidence reference for the UI.
    const logs=worlds.map(w=>h*w[0]+evidenceJ[0]*w[0]*w[1]+evidenceJ[1]*w[1]*w[2]);
    const peak=Math.max(...logs),p=logs.map(v=>Math.exp(v-peak)),sum=p.reduce((a,b)=>a+b,0);
    const posterior=p.map(v=>v/sum);
    return {means:[a,b,c],referencePosterior:posterior,referenceEntropy:-posterior.reduce((s,v)=>s+(v>0?v*Math.log2(v):0),0),
      messageAB:b,messageBC:c};
  }
  function sources(model,means){return model.templates.map((row,i)=>row.map(v=>v*means[i]));}
  const api={infer,worlds,sources};
  if(typeof module!=='undefined')module.exports=api;
  root.QualiaEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
