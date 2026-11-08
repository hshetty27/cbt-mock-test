const C=require('./engine.js'),fs=require('fs'),assert=require('assert');
const t=JSON.parse(fs.readFileSync('questions/sample1.json'));C.validate(t);
// Hand calc: 15 Qs. Right: Q1,Q2,Q3 (phy) +idx6 (carbon=6) +Q12(maths 144 idx1) = 5 right = +20. Wrong: Q4,Q8 = -2. Skipped rest.
const a={0:1,1:2,2:1,3:0,6:1,7:0,11:1};
const r=C.score(t,a,{});assert.strictEqual(r.score,5*4-2*1);assert.strictEqual(r.correct,5);assert.strictEqual(r.wrong,2);assert.strictEqual(r.skipped,8);assert.strictEqual(r.max,60);assert.strictEqual(r.accuracy,71.4);
const t2=JSON.parse(fs.readFileSync('questions/sample2.json'));C.validate(t2);
const r2=C.score(t2,{0:1,1:0,3:0,4:0},{});assert.strictEqual(r2.score,2-0.5+0+0); // English section: marks 1, negative 0 -> Q4 wrong=0, Q5 skipped... Q3 skipped
assert.strictEqual(r2.max,3*2+2*1);
assert.throws(()=>C.validate({sections:[]}));
console.log('engine tests passed');
