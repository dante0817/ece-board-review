/** Input-domain assertions for key mensuration formulas.
 * These tests prevent a future numeric question generator from silently using shortcuts outside their domain.
 * They DO NOT claim that the currently static questions are dynamically generated or that all edge cases are proven.
 */
import assert from 'node:assert/strict';
const positive=(...values)=>values.every(v=>Number.isFinite(v)&&v>0);
const allow=(formula,c)=>{
 const {r,R,h,B0,Bm,Bh,axisExternal=true,nonoverlapping=true,curveCentroid=true,sectionType='quadratic',right=true,openBase=false,parallel=true,similar=true,hemisphere=true,parentSphereRadius=undefined,upperRadius=undefined,lowerRadius=undefined}=c;
 switch(formula){
  case 'SMF-015':case 'SMF-025':return positive(r,h); // volume, oblique also allowed
  case 'SMF-016':case 'SMF-027':return right&&positive(r,h);
  case 'SMF-009':return right&&!openBase&&positive(B0,h);
  case 'SMF-018':return positive(R,r,h)&&R>r;
  case 'SMF-029':return parallel&&positive(R,h)&&r>=0&&R>=r;
  case 'SMF-031':return right&&parallel&&positive(R,h)&&r>=0&&R>=r;
  case 'SMF-033':return similar&&parallel&&positive(B0,Bh,h);
  case 'SMF-044':return positive(R)&&h>=0&&h<=2*R;
  case 'SMF-047':{
   if(!positive(upperRadius,lowerRadius,h,parentSphereRadius))return false;
   const radius=parentSphereRadius;
   if(upperRadius>radius||lowerRadius>radius)return false;
   const z1=Math.sqrt(radius*radius-upperRadius*upperRadius);
   const z2=Math.sqrt(radius*radius-lowerRadius*lowerRadius);
   return [z1+z2,Math.abs(z1-z2)].some(d=>Math.abs(d-h)<1e-7*Math.max(1,h));
  }
  case 'SMF-055':return positive(R,r)&&R>r;
  case 'SMF-065':return sectionType==='quadratic'&&positive(h)&&[B0,Bm,Bh].every(a=>a>=0&&Number.isFinite(a));
  case 'SMF-066':return axisExternal&&nonoverlapping&&positive(B0,R);
  case 'SMF-067':return axisExternal&&nonoverlapping&&curveCentroid&&positive(B0,R);
  case 'SMF-040':return hemisphere&&positive(R);
  default:throw new Error(`Formula outside domain matrix: ${formula}`);
 }
};
// Twenty explicit cases derived from the user's approved applicability plan (not from copyrighted exercises).
const tests=[
 ['VAL-01','SMF-015',{r:3,h:5,right:false},true],
 ['VAL-02','SMF-016',{r:3,h:5,right:false},false],
 ['VAL-03','SMF-025',{r:3,h:5,right:false},true],
 ['VAL-04','SMF-027',{r:3,h:5,right:false},false],
 ['VAL-05','SMF-018',{R:3,r:4,h:5},false],
 ['VAL-06','SMF-029',{R:5,r:2,h:4,parallel:true},true],
 ['VAL-07','SMF-031',{R:5,r:2,h:4,right:false},false],
 ['VAL-08','SMF-033',{B0:25,Bh:9,h:5,similar:true,parallel:true},true],
 ['VAL-09','SMF-033',{B0:25,Bh:9,h:5,similar:false},false],
 ['VAL-10','SMF-044',{R:5,h:11},false],
 ['VAL-11','SMF-044',{R:5,h:5},true],
 ['VAL-12','SMF-047',{upperRadius:2,lowerRadius:3,h:4,parentSphereRadius:3},false],
 ['VAL-13','SMF-055',{R:2,r:3},false],
 ['VAL-14','SMF-065',{B0:16,Bm:25,Bh:36,h:12,sectionType:'quadratic'},true],
 ['VAL-15','SMF-065',{B0:16,Bm:25,Bh:36,h:12,sectionType:'quartic'},false],
 ['VAL-16','SMF-066',{B0:6,R:5,axisExternal:false},false],
 ['VAL-17','SMF-067',{B0:8,R:3,axisExternal:false,nonoverlapping:false},false],
 ['VAL-18','SMF-067',{B0:8,R:3,curveCentroid:false},false],
 ['VAL-19','SMF-009',{B0:16,h:5,openBase:true},false],
 ['VAL-20','SMF-040',{R:3,hemisphere:true},true],
];
assert.equal(tests.length,20);
for(const [id,formula,inputs,expected] of tests)assert.equal(allow(formula,inputs),expected,`${id}: ${formula}`);
console.log('PASS Solid Mensuration domain restrictions: 20/20 allow/reject test designs for right/oblique shortcuts, spherical portions, prismoids, Pappus, frustums, open bases, hollow solids.');
