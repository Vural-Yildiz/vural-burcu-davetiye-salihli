const vm=require('node:vm'), fs=require('node:fs'), assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
function setup({src='',reduce=false,blocked=false}={}){
 let now=0,id=0;const jobs=new Map(), nodes=new Map();
 class El {constructor(){this.className='';this.attrs={};this.hidden=false;this.handlers={};this.style={};this.dataset={};this.paused=true;this.ended=false;this.complete=true;this.naturalWidth=864;this.currentTime=0;this.src='';}
 get classList(){return {add:(...v)=>this.className=[...new Set([...this.className.split(' ').filter(Boolean),...v])].join(' '),remove:(...v)=>this.className=this.className.split(' ').filter(x=>!v.includes(x)).join(' '),toggle:(x,b)=>b?this.classList.add(x):this.classList.remove(x),contains:x=>this.className.split(' ').includes(x)};}
 addEventListener(n,f){(this.handlers[n]??=[]).push(f);}emit(n){for(const f of this.handlers[n]||[])f({target:this});}setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}append(){}focus(){doc.activeElement=this;}pause(){const was=!this.paused;this.paused=true;if(was)this.emit('pause');}play(){if(blocked)return Promise.reject(Error('autoplay'));this.paused=false;this.emit('playing');return Promise.resolve();}}
 const q=s=>{if(!nodes.has(s))nodes.set(s,new El());return nodes.get(s);};const scenes=Array.from({length:10},(_,i)=>{const e=new El();e.dataset.scene=i+1;return e;});
 const doc={body:new El(),hidden:false,querySelector:q,querySelectorAll:s=>s==='.scene'?scenes:[],createElement:()=>new El(),handlers:{},addEventListener(n,f){this.handlers[n]=f;}};
 const reduced={matches:reduce,addEventListener(n,f){this.change=f;}};
 vm.runInNewContext(source,{document:doc,window:{INVITATION_INTRO:{src,loadTimeoutMs:1000},matchMedia:()=>reduced,scrollTo(){},open(){},location:{}},localStorage:{getItem(){},setItem(){}},Date,Promise,Number,String,encodeURIComponent,setInterval(){},setTimeout(f,ms){jobs.set(++id,{f,t:now+ms});return id;},clearTimeout(i){jobs.delete(i);}});
 async function flush(){await Promise.resolve();await Promise.resolve();}
 async function tick(ms){await flush();const end=now+ms;while(true){const j=[...jobs].filter(([,v])=>v.t<=end).sort((a,b)=>a[1].t-b[1].t)[0];if(!j)break;now=j[1].t;jobs.delete(j[0]);j[1].f();await flush();}now=end;}
 return {q,doc,reduced,scenes,tick,flush};
}
(async()=>{
 let s=setup();await s.tick(21000);assert(!s.q('.cinema__controls').hidden);assert.equal(s.q('#invitation').getAttribute('aria-hidden'),'true');s.q('#openInvitation').emit('click');assert.equal(s.q('#invitation').getAttribute('aria-hidden'),'false');s.q('#replayBtn').emit('click');assert(s.q('.cinema__controls').hidden);s.q('#skipIntro').emit('click');assert.equal(s.q('#invitation').getAttribute('aria-hidden'),'false');await s.tick(30000);assert(s.q('#opening').classList.contains('complete'));console.log('PASS fallback end, click, replay and skip cancel pending timers');
 s=setup({src:'assets/intro.mp4'});await s.flush();s.q('#introVideo').ended=true;s.q('#introVideo').emit('ended');assert(!s.q('.cinema__controls').hidden);assert.equal(s.q('#invitation').getAttribute('aria-hidden'),'true');s.q('#openInvitation').emit('click');assert.equal(s.q('#invitation').getAttribute('aria-hidden'),'false');console.log('PASS video end waits for invitation click');
 s=setup({src:'assets/intro.mp4',blocked:true});await s.flush();assert(!s.q('#resumeIntro').hidden);s.q('#skipIntro').emit('click');assert.equal(s.q('#invitation').getAttribute('aria-hidden'),'false');console.log('PASS blocked autoplay presents resume and skip');
 s=setup({src:'assets/intro.mp4'});await s.flush();s.q('#introVideo').emit('error');await s.tick(21000);assert(!s.q('.cinema__controls').hidden);console.log('PASS video error completes image fallback');
 s=setup({src:'assets/intro.mp4',reduce:true});assert.equal(s.q('#introVideo').src,'');assert(!s.q('.cinema__controls').hidden);console.log('PASS reduced motion skips media loading');
 s=setup({src:'assets/intro.mp4'});await s.flush();s.doc.hidden=true;s.doc.handlers.visibilitychange();assert(s.q('#introVideo').paused);s.doc.hidden=false;s.doc.handlers.visibilitychange();await s.flush();assert(!s.q('#introVideo').paused);console.log('PASS visibility pauses and resumes video');
 s.q('#introSound').emit('click');assert.equal(s.q('#introVideo').muted,false);console.log('PASS sound toggle');
})().catch(e=>{console.error(e);process.exit(1)});
