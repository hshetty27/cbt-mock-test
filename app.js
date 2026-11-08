const $=s=>document.querySelector(s),KEY='cbt_state_v1';
let T,F,S,timer;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const save=()=>localStorage.setItem(KEY,JSON.stringify({T,S}));
const fmt=s=>{s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
function show(id){['start','test','result'].forEach(x=>$('#'+x).hidden=x!==id)}
function flush(){const n=Date.now();S.times[S.i]=(S.times[S.i]||0)+(n-S.qs)/1000;S.qs=n}
function begin(test){T=CBT.validate(test);F=CBT.flatten(T);
 S={i:0,answers:{},visited:{0:1},marked:{},times:{},endAt:Date.now()+T.durationMinutes*60000,qs:Date.now(),done:false};save();run()}
function run(){F=CBT.flatten(T);show('test');$('#ttl').textContent=T.title||'Mock test';S.qs=Date.now();draw();clearInterval(timer);timer=setInterval(tick,500);tick()}
function tick(){const left=(S.endAt-Date.now())/1000;$('#timer').textContent=fmt(left);$('#timer').classList.toggle('low',left<300);
 if(left<=0)submit(true);else if(Math.round(left*2)%10===0){flush();save()}}
function status(i){return S.answers[i]!=null?(S.marked[i]?'am':'ans'):S.marked[i]?'mk':S.visited[i]?'nans':'unv'}
function draw(){const q=F[S.i];
 $('#qhead').textContent=q.sec+' · Q'+(S.i+1)+' of '+F.length;
 $('#marks').textContent='+'+q.marks+' right, '+q.neg+' wrong';
 $('#qtext').innerHTML=esc(q.q);
 $('#opts').innerHTML=q.opts.map((o,k)=>`<button class="opt${S.answers[S.i]===k?' sel':''}" data-k="${k}"><b>${'ABCDEFGH'[k]}</b>${esc(o)}</button>`).join('');
 $('#mark').textContent=S.marked[S.i]?'Unmark review':'Mark for review';
 $('#pal').innerHTML=T.sections.map(s=>{const idx=F.map((x,i)=>x.sec===s.name?i:-1).filter(i=>i>=0);
  return`<h4>${esc(s.name)}</h4><div class="grid">`+idx.map(i=>`<button class="p ${status(i)}${i===S.i?' cur':''}" data-i="${i}">${i+1}</button>`).join('')+'</div>'}).join('');
 const c=k=>F.filter((_,i)=>status(i)===k).length;
 $('#legend').innerHTML=`<span class="p ans">${c('ans')}</span>Answered <span class="p nans">${c('nans')}</span>Not answered <span class="p mk">${c('mk')+c('am')}</span>Review <span class="p unv">${c('unv')}</span>Not visited`}
function go(i){flush();S.i=Math.max(0,Math.min(F.length-1,i));S.visited[S.i]=1;save();draw()}
function submit(auto){if(S.done)return;flush();S.done=true;clearInterval(timer);save();result(auto)}
function result(auto){const r=CBT.score(T,S.answers,S.times);show('result');
 $('#rscore').textContent=r.score+' / '+r.max;
 $('#rsum').innerHTML=`${r.correct} correct · ${r.wrong} wrong · ${r.skipped} skipped · accuracy ${r.accuracy}%`+(auto?' · time ran out, test auto-submitted':'');
 $('#rsec').innerHTML='<tr><th>Section</th><th>Score</th><th>Correct</th><th>Wrong</th><th>Skipped</th></tr>'+Object.entries(r.sections).map(([n,s])=>`<tr><td>${esc(n)}</td><td>${s.score} / ${s.max}</td><td>${s.correct}</td><td>${s.wrong}</td><td>${s.skipped}</td></tr>`).join('');
 $('#rq').innerHTML='<tr><th>Q</th><th>Section</th><th>Result</th><th>Marks</th><th>Time</th></tr>'+r.rows.map(x=>`<tr><td>${x.n}</td><td>${esc(x.sec)}</td><td class="${x.status}">${x.status}</td><td>${x.marks}</td><td>${fmt(x.time)}</td></tr>`).join('')}
$('#opts').onclick=e=>{const b=e.target.closest('.opt');if(!b)return;const k=+b.dataset.k;S.answers[S.i]===k?delete S.answers[S.i]:S.answers[S.i]=k;save();draw()};
$('#pal').onclick=e=>{const b=e.target.closest('.p');if(b)go(+b.dataset.i)};
$('#next').onclick=()=>go(S.i+1);$('#prev').onclick=()=>go(S.i-1);
$('#clear').onclick=()=>{delete S.answers[S.i];save();draw()};
$('#mark').onclick=()=>{S.marked[S.i]?delete S.marked[S.i]:S.marked[S.i]=1;save();draw()};
$('#submit').onclick=()=>{if(confirm('Submit the test now? You cannot change answers afterwards.'))submit(false)};
$('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{begin(JSON.parse(await f.text()));$('#err').textContent=''}catch(x){$('#err').textContent='Could not load "'+f.name+'": '+x.message}};
$('#again').onclick=()=>{localStorage.removeItem(KEY);show('start')};
(function init(){let s;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(s&&s.T&&s.S){T=s.T;S=s.S;F=CBT.flatten(T);S.done?result(false):run()}else show('start')})();
