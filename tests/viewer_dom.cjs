// Minimal DOM adapter for control-flow tests; NOT a browser/layout test.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={};
for(const [,id] of fs.readFileSync('index.html','utf8').matchAll(/id="([^"]+)"/g))elements[id]={
 value:id==='mode'?'shared':0,checked:false,textContent:'',innerHTML:'',disabled:false,
 style:{},classList:{toggle(){}},listeners:{},
 addEventListener(k,f){this.listeners[k]=f;},getBoundingClientRect(){return {width:300,height:145};},
 getContext(){return new Proxy({},{get:()=>()=>{}});},replaceChildren(){},append(){}};
const ctx={console,Math,JSON,Number,Array,document:{getElementById:id=>elements[id],createElement:()=>({style:{},append(){}})},addEventListener(){},devicePixelRatio:1};ctx.window=ctx;ctx.globalThis=ctx;
vm.createContext(ctx);
for(const f of ['viewer_engine.js','viewer_model.js','viewer.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const failures=[];
function check(name,f){try{f();console.log('PASS',name);}catch(e){failures.push(name);console.error('FAIL',name,e.message);}}
check('unrevealed clue has neutral slider',()=>assert.equal(Number(elements.clue.value),0));
check('new worlds include both source-A signs',()=>{const signs=new Set();for(let i=0;i<64;i++){ctx.newScene();signs.add(vm.runInContext('truth[0]',ctx));}assert.equal(signs.size,2);});
check('truth overlay has separate ground truth templates',()=>{assert(ctx.QUALIA_TRUTH);assert.equal(ctx.QUALIA_TRUTH.length,3);assert.notDeepEqual(ctx.QUALIA_TRUTH,ctx.QUALIA_MODEL.templates);});
check('reveal, cut, reverse and removal controls respond',()=>{
 elements.reveal.listeners.click();elements.clue.value=1;elements.clue.listeners.input();
 const normal=elements.beliefC.textContent;assert.notEqual(normal,'P(+) 50.0%');
 elements.mode.value='cut';elements.mode.listeners.change();assert.equal(elements.beliefC.textContent,'P(+) 50.0%');
 elements.mode.value='reverse';elements.mode.listeners.change();assert.notEqual(elements.beliefC.textContent,normal);
 elements.mode.value='shared';elements.mode.listeners.change();elements.remove.checked=true;elements.remove.listeners.change();assert.equal(elements.beliefC.textContent,normal);
 elements.reveal.listeners.click();assert.equal(elements.beliefC.textContent,'P(+) 50.0%');
});
if(failures.length)process.exit(1);
