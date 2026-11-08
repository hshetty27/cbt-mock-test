(function(root){
function flatten(t){const o=[];t.sections.forEach(s=>s.questions.forEach(q=>o.push({sec:s.name,q:q.q,opts:q.options,ans:q.answer,marks:q.marks??s.marks??t.marking.correct,neg:q.negative??s.negative??t.marking.wrong})));return o}
function validate(t){
 if(!t||!Array.isArray(t.sections)||!t.sections.length)throw new Error('File needs a "sections" list.');
 if(!t.marking||typeof t.marking.correct!=='number'||typeof t.marking.wrong!=='number')throw new Error('File needs "marking": {"correct": n, "wrong": -n}.');
 if(typeof t.durationMinutes!=='number'||t.durationMinutes<=0)throw new Error('File needs a positive "durationMinutes".');
 t.sections.forEach((s,i)=>{if(!s.name||!Array.isArray(s.questions)||!s.questions.length)throw new Error('Section '+(i+1)+' needs a name and questions.');
  s.questions.forEach((q,j)=>{if(!q.q||!Array.isArray(q.options)||q.options.length<2||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)throw new Error('Bad question '+(j+1)+' in section "'+s.name+'" (needs q, options, answer index).')})});
 return t}
function score(t,answers,times){
 const F=flatten(t),secs={};let sc=0,c=0,w=0,sk=0;
 const rows=F.map((x,i)=>{const a=answers[i];let st='skipped',m=0;
  if(a!=null){if(a===x.ans){st='correct';m=x.marks;c++}else{st='wrong';m=x.neg;w++}}else sk++;
  sc+=m;const s=secs[x.sec]||(secs[x.sec]={score:0,correct:0,wrong:0,skipped:0,max:0});
  s.score+=m;s.max+=x.marks;s[st]++;
  return{n:i+1,sec:x.sec,status:st,marks:m,time:Math.round((times&&times[i])||0)}});
 const att=c+w;
 return{score:sc,max:F.reduce((a,x)=>a+x.marks,0),correct:c,wrong:w,skipped:sk,accuracy:att?Math.round(c/att*1000)/10:0,sections:secs,rows}}
const api={flatten,validate,score};
if(typeof module!=='undefined')module.exports=api;else root.CBT=api;
})(this);
