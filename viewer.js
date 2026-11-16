/* UI only. Hidden truth is never passed to QualiaEngine.infer. */
const $=id=>document.getElementById(id),E=QualiaEngine,M=QUALIA_MODEL;
let scene=0,truth=[1,1,-1],relations=[1,-1],shown=false,actualClue=1;
const colors=['#ffb36b','#8edac1','#b8afff'];
function rng(seed){return ()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};}
function normal(r){return Math.sqrt(-2*Math.log(r()))*Math.cos(2*Math.PI*r());}
function sum(rows){return rows[0].map((_,j)=>rows.reduce((s,row)=>s+row[j],0));}
function wave(signs){return sum(E.sources(M,signs));}
function signs(z){return z.map(v=>v>0?'+':'−').join(' ');}
function draw(id,lines,palette,dashed=[]){
 const canvas=$(id),rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
 canvas.width=Math.max(1,Math.round(rect.width*dpr));canvas.height=Math.max(1,Math.round(rect.height*dpr));
 const c=canvas.getContext('2d');c.scale(dpr,dpr);const w=rect.width,h=rect.height;
 c.clearRect(0,0,w,h);c.strokeStyle='#243248';c.lineWidth=1;c.beginPath();c.moveTo(0,h/2);c.lineTo(w,h/2);c.stroke();
 for(let k=0;k<lines.length;k++){
  c.strokeStyle=palette[k];c.lineWidth=dashed.includes(k)?1.2:1.8;c.setLineDash(dashed.includes(k)?[4,5]:[]);c.beginPath();
  lines[k].forEach((v,i)=>{const x=i/(lines[k].length-1)*w,y=h/2-v*h/4; i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();
 }
 c.setLineDash([]);
}
function newScene(){
 scene++;const r=rng(701+scene);truth=Array.from({length:3},()=>r()>.5?1:-1);
 relations=[truth[0]*truth[1]+.3*normal(r),truth[1]*truth[2]+.3*normal(r)];
 actualClue=Math.max(-2,Math.min(2,truth[0]+.65*normal(r)));
 $('clue').value=actualClue;shown=false;$('mode').value='shared';$('remove').checked=false;
 $('seed').textContent=`Illustrative scene ${scene} · seed ${701+scene}`;render();
}
function render(){
 const q=shown?Number($('clue').value):null,mode=$('mode').value;
 const out=E.infer(M,relations,q,mode),baseline=E.infer(M,relations,q,'shared');
 const parts=E.sources(M,out.means),originalParts=E.sources(M,baseline.means);
 const renderParts=parts.map(row=>row.slice());if($('remove').checked)renderParts[0].fill(0);
 $('reveal').textContent=shown?'Hide local clue':'Reveal local clue';
 $('clue').disabled=!shown;$('clueValue').textContent=shown?Number(q).toFixed(2):'not observed';
 $('state').textContent=mode==='shared'?(shown?'Evidence shared':'Ambiguity preserved'):'Intervention active';
 ['A','B','C'].forEach((v,i)=>$('belief'+v).textContent=`P(+) ${((out.means[i]+1)*50).toFixed(1)}%`);
 $('relAB').textContent=`relation ${relations[0].toFixed(2)}`;$('relBC').textContent=`relation ${relations[1].toFixed(2)}`;
 $('msgAB').textContent=`→ ${out.messageAB.toFixed(2)}`;$('msgBC').textContent=`→ ${out.messageBC.toFixed(2)}`;
 $('edgeAB').classList.toggle('cut',['cut','uniform','independent'].includes(mode));
 $('edgeBC').classList.toggle('cut',mode==='independent');
 const explanations={shared:shown?'The signed clue at A updates B and C through their learned relationships. Hidden-source traces remain unseen.':'The relation sensors constrain the world, but its global sign is unknown. A zero mean conceals opposing alternatives.',cut:'A can use its clue. The cut prevents B and C from learning its sign; their relationship still exists.',uniform:'A → B carries no sign evidence. Downstream units recompute; their predictions become unresolved.',reverse:'Only A → B is reversed. A keeps its belief; B and C revise together in the opposite direction. Coherence alone does not ensure truth.',independent:'Each unit has only its own evidence. B and C have no local signed clue, so they remain unresolved.'};
 $('explanation').textContent=explanations[mode]+($('remove').checked?' A is omitted from the combined drawing only.':'');
 draw('parts',parts,colors);const total=[sum(renderParts)],palette=['#edf0ed'];
 if($('truth').checked){total.push(wave(truth));palette.push('#687c94');}draw('total',total,palette,[1]);
 $('entropy').textContent=`${out.entropy.toFixed(2)} bits uncertainty`;
 const order=out.posterior.map((p,i)=>({p,i})).sort((a,b)=>b.p-a.p);
 for(let k=0;k<2;k++){const x=order[k];$('world'+(k+1)).textContent=signs(E.worlds[x.i]);$('prob'+(k+1)).textContent=(x.p*100).toFixed(1)+'%';draw('alt'+(k+1),[wave(E.worlds[x.i])],[k?'#8c9eb8':'#8edac1']);}
 $('posterior').replaceChildren(...out.posterior.map((p,i)=>{const d=document.createElement('div');d.className='bar';d.style.height=(p*100)+'%';d.title=signs(E.worlds[i])+': '+(p*100).toFixed(2)+'%';const label=document.createElement('i');label.textContent=signs(E.worlds[i]).replaceAll(' ','');d.append(label);return d;}));
 const effect=Math.sqrt(parts.slice(1).flatMap((row,k)=>row.map((v,i)=>(v-originalParts[k+1][i])**2)).reduce((a,b)=>a+b,0)/128);
 $('effect').innerHTML=`${effect.toFixed(3)} <small>remote waveform RMS</small>`;
 if(window.QUALIA_RESULTS){const s=QUALIA_RESULTS,rows=['shared','disconnected','shuffled','exact'].map(n=>`<tr><td>${{shared:'Shared messages',disconnected:'Disconnected',shuffled:'Shuffled relations',exact:'Exact Bayes'}[n]}</td><td>${s.metrics[n].remote_relative_mse.toFixed(3)}</td></tr>`).join('');$('results').innerHTML=`<table><thead><tr><th>Method</th><th>Remote error ↓</th></tr></thead><tbody>${rows}</tbody></table><p class="small">Zero prediction = 1. Exact Bayes ties. ${s.all_pass?'All four specified mechanism gates passed.':'Some mechanism gates failed.'} <a href="https://github.com/anttiluode/QualiaAstra/blob/main/RESULTS.md">Read the limits ↗</a></p>`;}
}
$('new').addEventListener('click',newScene);$('reveal').addEventListener('click',()=>{shown=!shown;render();});
['mode','remove','truth'].forEach(id=>$(id).addEventListener('change',render));$('clue').addEventListener('input',render);
window.addEventListener('resize',render);newScene();
