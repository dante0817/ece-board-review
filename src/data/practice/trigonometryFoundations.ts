import type {TrigPilotQuestion} from './trigonometryPilot';
/** New, original four-choice review questions, manually specified answers and explanations.
 * 'draft-unverified': mathematical source review and automated checks are NOT an expert sign-off.
 * Stable keys TRF-<family>-<sequence> never depend on display order.
 */
type Entry=[string,string,[string,string,string],string,'Basic'|'Intermediate'|'Advanced',string];
const rows:{id:string;tag:string;items:Entry[]}[]=[
{id:'trig-angles-angles-and-their-classification',tag:'ANG',items:[
 ['Which angle is acute?','45°',['90°','120°','180°'],'An acute angle lies strictly between 0° and 90°.', 'Basic','classification'],
 ['Classify 145°.','Obtuse',['Acute','Right','Reflex'],'145° is between 90° and 180°.', 'Basic','classification'],
 ['What is the measure of a straight angle?','180°',['90°','270°','360°'],'A straight angle makes a half-turn, exactly 180°.', 'Basic','definitions'],
 ['Which measure is reflex in the interval 0° to 360°?','250°',['80°','120°','180°'],'A reflex angle lies strictly between 180° and 360°.', 'Intermediate','classification'],
 ['Which angle is a full revolution?','360°',['45°','90°','180°'],'A complete counterclockwise turn totals 360°.', 'Intermediate','rotations'],
 ['An initial ray points east. After rotating clockwise through 30°, where is the terminal ray?','Quadrant IV',['Quadrant I','Quadrant II','Quadrant III'],'Clockwise means a negative directed angle, ending 30° below the positive x-axis.', 'Intermediate','directed-angle'],
 ['An angle measures exactly 90°. Its classification is','Right',['Acute','Obtuse','Reflex'],'A right angle is precisely 90°, not acute or obtuse.', 'Intermediate','boundaries'],
 ['How many whole turns are represented by 1080°?','3',['2','4','6'],'1080°÷360° per turn=3.', 'Advanced','full-turns']
]},
{id:'trig-angles-degrees-minutes-and-seconds-dms',tag:'DMS',items:[
 ['Convert 30′ into degrees.','0.5°',['0.3°','5°','30°'],'30 arcminutes ÷60 arcminutes/degree=0.5°.', 'Basic','minutes'],
 ['Convert 45″ into arcminutes.','0.75′',['0.45′','1.25′','45′'],'45 arcseconds/60=0.75 arcminute.', 'Basic','seconds'],
 ['Convert 18° 30′ into decimal degrees.','18.5°',['18.3°','18.05°','18.8333°'],'30′/60=0.5°, so 18°30′=18.5°.', 'Basic','conversion'],
 ['Convert 62.25° into DMS.','62°15′00″',['62°25′00″','62°02′30″','62°30′00″'],'0.25×60=15 whole arcminutes.', 'Intermediate','conversion'],
 ['Convert 12° 15′ 36″ into decimal degrees.','12.26°',['12.15°','12.256°','12.60°'],'12+15/60+36/3600=12+0.25+0.01=12.26°.', 'Intermediate','conversion'],
 ['Convert 0.125° into DMS.','0°07′30″',['0°12′50″','0°08′00″','0°01′25″'],'0.125×60=7.5 minutes, and 0.5 minute=30 seconds.', 'Intermediate','conversion'],
 ['How many arcseconds are in 2°?','7200″',['120″','3600″','360″'],'2×60×60=7200 arcseconds.', 'Advanced','unit-conversion'],
 ['Convert −10°30′00″ into a single decimal-degree value.','−10.5°',['−9.5°','−10.3°','−10.05°'],'The negative sign applies to the entire angle: −(10+30/60)=−10.5°.', 'Advanced','negative-dms']
]},
{id:'trig-angles-degreeradian-conversion',tag:'CVT',items:[
 ['Convert 180° to radians.','π rad',['π/2 rad','2π rad','π/3 rad'],'180° = π radians by definition.', 'Basic','angle-conversion'],
 ['Convert 30° to radians.','π/6 rad',['π/3 rad','π/4 rad','π/2 rad'],'30×π/180=π/6 radians.', 'Basic','angle-conversion'],
 ['Convert π/4 rad to degrees.','45°',['30°','60°','90°'],'(π/4)×180/π=45°.', 'Basic','angle-conversion'],
 ['Convert 240° to radians.','4π/3 rad',['3π/4 rad','2π/3 rad','5π/4 rad'],'240π/180=4π/3 radians.', 'Intermediate','angle-conversion'],
 ['Convert −5π/6 rad to degrees.','−150°',['−120°','−30°','150°'],'−(5×180/6)=−150°.', 'Intermediate','negative-angle'],
 ['Convert 7π/4 rad to degrees.','315°',['270°','300°','330°'],'7×180/4=315°.', 'Intermediate','angle-conversion'],
 ['Convert 11π/12 rad to degrees.','165°',['155°','175°','195°'],'11×180/12=11×15=165°.', 'Advanced','fractional-radians'],
 ['Convert −420° to an exact radian value.','−7π/3 rad',['−4π/3 rad','−7π/6 rad','−5π/3 rad'],'−420×π/180=−7π/3 radians.', 'Advanced','negative-angle']
]},
{id:'trig-angles-coterminal-angles-and-rotations',tag:'COT',items:[
 ['Which angle is coterminal with 40°?','400°',['140°','220°','280°'],'400°−40°=360°, one full revolution.', 'Basic','coterminal'],
 ['Find the coterminal angle in [0°,360°) for 450°.','90°',['45°','180°','270°'],'450−360=90°.', 'Basic','normalization'],
 ['Find the principal nonnegative angle for −60°.','300°',['60°','240°','120°'],'−60+360=300°.', 'Basic','normalization'],
 ['Find the angle coterminal with 810° in [0°,360°).','90°',['180°','270°','45°'],'810−720=90°.', 'Intermediate','multi-turn'],
 ['Which expression gives all angles coterminal with θ degrees?','θ + 360°k, k an integer',['θ + 180°k, k an integer','θ + 90°k, k an integer','θ + k°, k an integer'],'Only multiples of a full 360° turn preserve the terminal side for all integers k.', 'Intermediate','general-form'],
 ['Find a principal coterminal representative of −13π/6 in [0,2π).','11π/6',['π/6','7π/6','13π/6'],'Add 4π=24π/6 to −13π/6, giving 11π/6.', 'Intermediate','radian-normalization'],
 ['How many full revolutions are included in 765° before its final 45°?','2',['1','3','4'],'765°=2×360°+45°.', 'Advanced','turn-count'],
 ['Find the principal coterminal representative of −855°.','225°',['135°','45°','315°'],'−855°+3×360°=225°.', 'Advanced','negative-multi-turn']
]},
{id:'trig-angles-arc-length-and-sector-area',tag:'ARC',items:[
 ['Find arc length for r=5 m and θ=2 rad.','10 m',['2.5 m','7 m','25 m'],'s=rθ=5×2=10 m.', 'Basic','arc-length'],
 ['Find the area of a sector with r=4 cm and θ=1 rad.','8 cm²',['4 cm²','16 cm²','2 cm²'],'A=½r²θ=½×16×1=8 cm².', 'Basic','sector-area'],
 ['A circle has radius 3 cm. Find arc length for 60°.','π cm',['2π cm','3π cm','π/2 cm'],'60°=π/3 rad, so s=3π/3=π cm.', 'Basic','degree-to-arc'],
 ['For radius 6 m and central angle π/2, what is the sector area?','9π m²',['6π m²','18π m²','36π m²'],'A=½×36×π/2=9π m².', 'Intermediate','sector-area'],
 ['For arc length 8 cm and radius 4 cm, what is θ in radians?','2 rad',['0.5 rad','4 rad','32 rad'],'θ=s/r=8/4=2 radians.', 'Intermediate','angle-from-arc'],
 ['What fraction of a disk is a 72° sector?','1/5',['1/4','1/6','2/5'],'72°/360°=1/5.', 'Intermediate','sector-fraction'],
 ['A 90° sector has radius 8 m. Find its exact area.','16π m²',['8π m²','32π m²','64π m²'],'Quarter of πr² = ¼×64π=16π m².', 'Advanced','area-fraction'],
 ['A circle has radius 10 cm and arc length 5π cm. What is the central angle?','π/2 rad',['π/4 rad','π rad','2π rad'],'θ=s/r=(5π)/10=π/2 radians.', 'Advanced','inverse-arc']
]},
{id:'trig-angles-linear-and-angular-speed',tag:'SPD',items:[
 ['A rotating shaft makes 2 revolutions per second. What is ω?','4π rad/s',['2π rad/s','π rad/s','8π rad/s'],'Each revolution is 2π rad: ω=2×2π=4π rad/s.', 'Basic','angular-frequency'],
 ['With r=0.5 m and ω=6 rad/s, find tangential speed.','3 m/s',['12 m/s','6.5 m/s','0.0833 m/s'],'v=rω=0.5×6=3 m/s.', 'Basic','tangential-speed'],
 ['A disc rotates through 12 rad in 3 s. Find average angular speed.','4 rad/s',['36 rad/s','9 rad/s','0.25 rad/s'],'ω=Δθ/Δt=12/3=4 rad/s.', 'Basic','mean-angular-speed'],
 ['Convert 60 rpm to revolutions per second.','1 rev/s',['60 rev/s','2 rev/s','0.1 rev/s'],'60 revolutions/min divided by 60 seconds/min =1 rev/s.', 'Intermediate','rpm-conversion'],
 ['Convert 180 rpm to angular speed.','6π rad/s',['3π rad/s','9π rad/s','180π rad/s'],'180 rpm=3 rev/s; ω=3×2π=6π rad/s.', 'Intermediate','rpm-to-rad'],
 ['A point 0.4 m from the axis has speed 2 m/s. Find |ω|.','5 rad/s',['0.8 rad/s','2.4 rad/s','0.2 rad/s'],'|ω|=v/r=2/0.4=5 rad/s.', 'Intermediate','angular-from-linear'],
 ['A wheel of radius 0.25 m rolls without slipping at 4 rad/s. Find speed.','1 m/s',['16 m/s','4.25 m/s','0.0625 m/s'],'v=r|ω|=0.25×4=1 m/s.', 'Advanced','no-slip'],
 ['If angular speed doubles while radius stays fixed, tangential speed will','Double',['Halve','Stay the same','Quadruple'],'The relation v=r|ω| is directly proportional to ω for fixed r.', 'Advanced','proportionality']
]},
{id:'trig-right-triangles-pythagorean-theorem-and-special-triangles',tag:'PYT',items:[
 ['A right triangle has legs 6 and 8. Find its hypotenuse.','10',['12','14','√14'],'c=√(6²+8²)=√100=10.', 'Basic','pythagoras'],
 ['A 45°–45°–90° triangle has a leg of length 5. Find its hypotenuse.','5√2',['10','5√3','5/√2'],'The hypotenuse is leg×√2.', 'Basic','special-triangles'],
 ['A 30°–60°–90° triangle has short leg 3. Find its hypotenuse.','6',['3√2','3√3','9'],'The 1:√3:2 ratio gives 2×3=6.', 'Basic','special-triangles'],
 ['Hypotenuse is 13 and one leg is 5. Find the remaining leg.','12',['8','18','√194'],'√(13²−5²)=√144=12.', 'Intermediate','missing-leg'],
 ['A 30°–60°–90° triangle has short leg 4. Find its long leg.','4√3',['8','4√2','2√3'],'The long leg is short leg×√3.', 'Intermediate','special-triangles'],
 ['A square has side length 7. Find its diagonal.','7√2',['14','7√3','49'],'Diagonal splits square into 45°–45°–90° triangle.', 'Intermediate','diagonal'],
 ['Which triple of lengths can form a right triangle?','8, 15, 17',['7, 8, 9','5, 6, 7','9, 10, 11'],'8²+15²=64+225=289=17².', 'Advanced','converse'],
 ['In a 30°–60°–90° triangle, the hypotenuse is 20. Find the long leg.','10√3',['20√3','10','5√3'],'Short leg is half the hypotenuse (10), and long leg is 10√3.', 'Advanced','special-triangles']
]},
{id:'trig-right-triangles-exact-values-of-special-angles',tag:'SPC',items:[
 ['Find sin30° exactly.','1/2',['√3/2','√2/2','1'],'The 30°–60°–90° side ratio yields sine30°=1/2.', 'Basic','sin-special'],
 ['Find cos60° exactly.','1/2',['√3/2','√2/2','0'],'Cos60°=sin30°=1/2.', 'Basic','cos-special'],
 ['Find tan45° exactly.','1',['√3','1/√3','0'],'The equal legs of a 45° right triangle give tangent=1.', 'Basic','tan-special'],
 ['Find sin60° exactly.','√3/2',['1/2','√2/2','√3'],'Sine60° is long leg/hypotenuse =√3/2.', 'Intermediate','sin-special'],
 ['Find sec60° exactly.','2',['1/2','√3','2√3/3'],'sec60°=1/cos60°=1/(1/2)=2.', 'Intermediate','sec-special'],
 ['Find cot30° exactly.','√3',['√3/3','1','2'],'cot30°=1/tan30°=√3.', 'Intermediate','cot-special'],
 ['Find csc45° exactly.','√2',['√2/2','2','1/√3'],'csc45°=1/(√2/2)=√2.', 'Advanced','reciprocal-special'],
 ['Which expression is undefined?','tan90°',['sin90°','cos90°','sin0°'],'tanθ=sinθ/cosθ and cos90°=0.', 'Advanced','undefined']
]},
{id:'trig-right-triangles-cofunction-relations',tag:'COF',items:[
 ['Complete: sin20° = cos(?).','70°',['20°','90°','80°'],'Sine and cosine are cofunctions: complementary angles add to 90°.', 'Basic','sine-cosine'],
 ['Complete: cos40° = sin(?).','50°',['40°','140°','90°'],'90°−40°=50°.', 'Basic','cosine-sine'],
 ['Complete: tan30° = cot(?).','60°',['30°','45°','90°'],'cot(90°−θ)=tanθ.', 'Basic','tan-cot'],
 ['Express sin(π/6) as cosine of a complementary angle.','cos(π/3)',['cos(π/6)','cos(π/2)','cos(2π/3)'],'π/2−π/6=π/3.', 'Intermediate','radian-cofunction'],
 ['If sinθ=4/5 for an acute θ, what is cos(90°−θ)?','4/5',['3/5','5/4','5/3'],'cos(90°−θ)=sinθ.', 'Intermediate','cofunction-value'],
 ['Which pair are cofunctions?','sec and csc',['sin and tan','cos and cot','sin and sec'],'Secant and cosecant exchange under the complement.', 'Intermediate','cofunction-pairs'],
 ['Complete: sec25° = csc(?).','65°',['25°','75°','115°'],'secθ=csc(90°−θ), where both sides are defined.', 'Advanced','sec-csc'],
 ['If cot(37°)=k, which tangent expression equals k?','tan53°',['tan37°','tan143°','tan90°'],'tan(90°−37°)=tan53°=cot37°.', 'Advanced','tan-cot']
]},
{id:'trig-right-triangles-finding-unknown-sides-and-angles',tag:'FND',items:[
 ['A hypotenuse is 10 cm and angle 30°. Find the opposite side.','5 cm',['10 cm','5√3 cm','20 cm'],'opposite=10sin30°=5 cm.', 'Basic','opposite'],
 ['An acute angle θ has opposite=3, adjacent=4. What is tanθ?','3/4',['4/3','3/5','4/5'],'tanθ=opposite/adjacent=3/4.', 'Basic','ratios'],
 ['A hypotenuse is 20 m and angle 60°. Find adjacent side.','10 m',['10√3 m','20√3 m','5 m'],'adjacent=20cos60°=10 m.', 'Basic','adjacent'],
 ['A right triangle has opposite=5, hypotenuse=13. Find sinθ.','5/13',['12/13','5/12','13/5'],'Sine is opposite divided by hypotenuse.', 'Intermediate','ratios'],
 ['An acute θ has tanθ=1. Find θ.','45°',['30°','60°','90°'],'Equal opposite and adjacent legs give 45°.', 'Intermediate','angle'],
 ['An acute θ has cosθ=1/2. Find θ.','60°',['30°','45°','90°'],'cos60°=1/2 in the right-triangle principal acute range.', 'Intermediate','angle'],
 ['An acute θ has sinθ=√2/2. Find θ.','45°',['30°','60°','90°'],'sin45°=√2/2.', 'Advanced','inverse-special'],
 ['A right triangle has opposite=9, adjacent=12. Find hypotenuse.','15',['21','√21','3'],'By Pythagoras, c=√(9²+12²)=15.', 'Advanced','missing-side']
]},
{id:'trig-right-triangles-solving-right-triangles',tag:'SLV',items:[
 ['One acute angle of a right triangle is 35°. Find the other acute angle.','55°',['45°','65°','145°'],'Two acute angles total 90°: 90°−35°=55°.', 'Basic','complement'],
 ['Both legs of a right triangle are 5. Find the hypotenuse.','5√2',['10','5√3','25'],'c²=5²+5²=50, so c=5√2.', 'Basic','hypotenuse'],
 ['The legs are 8 and 15. Find the hypotenuse.','17',['23','√23','16'],'c²=64+225=289, so c=17.', 'Basic','pythagoras'],
 ['In a right triangle, an acute angle is 60° and the hypotenuse is 12. Find the opposite leg.','6√3',['6','12√3','3√3'],'o=12sin60°=6√3.', 'Intermediate','sine'],
 ['In a right triangle, an acute angle is 30° and hypotenuse is 18. Find adjacent leg.','9√3',['9','18√3','6√3'],'a=18cos30°=9√3.', 'Intermediate','cosine'],
 ['A right triangle has legs 3 and 4. Find the acute angle opposite the shorter leg (nearest 0.1°).','36.9°',['53.1°','30.0°','45.0°'],'θ=arctan(3/4)≈36.8699°, hence 36.9°.', 'Intermediate','inverse-tan'],
 ['A right triangle has hypotenuse 10 and leg 6. Find its other leg.','8',['4','16','√136'],'b=√(10²−6²)=√64=8.', 'Advanced','missing-leg'],
 ['A right triangle has angles 90°, 25°, and x°. Find x.','65°',['55°','75°','155°'],'Sum angles 180°: x=180−90−25=65°.', 'Advanced','angle-sum']
]},
{id:'trig-right-triangles-elevation-depression-bearings-and-applications',tag:'APP',items:[
 ['A 10 m ladder inclined at 30° to ground reaches what vertical height?','5 m',['5√3 m','10 m','20 m'],'Height=10sin30°=5 m.', 'Basic','elevation'],
 ['A point due east has compass bearing (clockwise from north) of','090°',['000°','180°','270°'],'East lies 90° clockwise from north.', 'Basic','bearing'],
 ['A point due south has compass bearing of','180°',['090°','270°','000°'],'South is a half-turn clockwise from north.', 'Basic','bearing'],
 ['A 20 m horizontal distance and 45° elevation angle imply what vertical height difference?','20 m',['10 m','20√2 m','40 m'],'h=20tan45°=20 m.', 'Intermediate','elevation'],
 ['A 30 m tower casts a 30 m horizontal shadow. Find the sun elevation angle.','45°',['30°','60°','90°'],'tanθ=height/shadow=30/30=1, so θ=45°.', 'Intermediate','elevation'],
 ['A platform is 40 m above ground and a target is 40 m horizontally away. Find depression angle.','45°',['30°','60°','90°'],'tanθ=40/40=1, so θ=45°.', 'Intermediate','depression'],
 ['A direction N30°E corresponds to a clockwise-from-north bearing of','030°',['330°','060°','300°'],'N30°E means turn 30° from north toward east.', 'Advanced','bearing-conversion'],
 ['A direction S20°W corresponds to clockwise-from-north bearing of','200°',['160°','340°','020°'],'South is 180°, and 20° toward west increases clockwise bearing to 200°.', 'Advanced','bearing-conversion']
]}
];
const out:TrigPilotQuestion[]=[];
for(const row of rows){row.items.forEach(([prompt,correct,wrong,explanation,difficulty,family],index)=>{
  const correctIndex=(index*3+1)%4 as 0|1|2|3;
  const options=[...wrong];options.splice(correctIndex,0,correct);
  out.push({id:`TRF-${row.tag}-${String(index+1).padStart(3,'0')}`,subtopicId:row.id,difficulty,family,prompt,options:options as [string,string,string,string],correctIndex,explanation});
});}
export const TRIGONOMETRY_FOUNDATIONS_QUESTIONS:TrigPilotQuestion[]=out;
export const TRIGONOMETRY_FOUNDATIONS_EXPECTED:Record<string,string>=Object.fromEntries(rows.flatMap(row=>row.items.map(([p,correct],i)=>[`TRF-${row.tag}-${String(i+1).padStart(3,'0')}`,correct])));
