import type { LearnLesson, LessonBlock, LessonSection } from '../../domain/learn/lessonTypes';

/** Original pilot lessons guided by the named sections of the six user-provided references.
 * Draft until independent editorial review. Content is NOT a copy of the books.
 * Lesson IDs are exactly the stable IDs in the v10.36 Trigonometry curriculum.
 */
const section=(id:string,title:string,blocks:LessonBlock[]):LessonSection=>({id,title,objectiveIds:[`trig-obj-${id}`],blocks});
export const TRIGONOMETRY_PILOT_LESSONS: Record<string,LearnLesson> = {
  'trig-angles-radian-measure': {
    id:'trig-angles-radian-measure',title:'Radian Measure',summary:'Interpret radians as arc length divided by radius and use angle units correctly.',status:'draft',contentVersion:1,
    sections:[
      section('radian-concept','What a radian measures',[
        {id:'rad-def',type:'definition',text:'One radian is the central angle that intercepts an arc whose length equals the circle’s radius. Its definition is based on a ratio of lengths.'},
        {id:'rad-picture',type:'diagram',diagram:'radian',caption:'A central angle of 1 radian intercepts an arc of length r on a circle of radius r.'},
        {id:'rad-formula',type:'formula',latex:'\\theta=\\frac{s}{r}\\quad\\text{(radians)},\\qquad s=r\\theta',description:'s and r must use the same distance unit. The arc-length formula requires theta in radians.'},
        {id:'rad-note',type:'note',text:'Calculator check: use RAD mode when the input angle is in radians, and DEG mode when it is in degrees. Do not insert a degree-marked value directly into $s=r\\theta$.'},
        {id:'rad-example',type:'worked-example',title:'From arc to angle',problem:'A circle has radius 12 cm and arc length 8 cm. Find the central angle in radians.',strategy:'Divide intercepted arc length by radius.',steps:['Use $\\theta=s/r$.','Substitute: $\\theta=8/12$.','Simplify: $\\theta=2/3$ rad.'],check:'$r\\theta=12(2/3)=8$ cm, matching the given arc.'},
        {id:'rad-check',type:'checkpoint',prompt:'An arc of 9 m on a circle of radius 3 m subtends what angle?',answer:'3 radians.',explanation:'Use $\\theta=s/r=9/3=3$.'},
      ]),
      section('radian-circle','Full turns and standard angles',[
        {id:'full-turn',type:'paragraph',text:'A complete circle has circumference $2\\pi r$, so one full turn contains $2\\pi$ radians. Half and quarter turns are $\\pi$ and $\\pi/2$ radians.'},
        {id:'full-formula',type:'formula',latex:'360^\\circ=2\\pi\\text{ rad},\\quad180^\\circ=\\pi\\text{ rad},\\quad90^\\circ=\\frac{\\pi}{2}\\text{ rad}'},
        {id:'rad-example-2',type:'worked-example',title:'Fraction of a full turn',problem:'Express a three-quarter turn in radians.',steps:['One turn is $2\\pi$ radians.','Multiply: $(3/4)(2\\pi)=3\\pi/2$ rad.'],check:'Three-quarter turn is 270°, equivalent to $3\\pi/2$ rad.'},
        {id:'rad-check-2',type:'checkpoint',prompt:'How many radians are in one-eighth of a full turn?',answer:'$\\pi/4$ radians.',explanation:'Multiply $2\\pi$ by $1/8$.'},
      ]),
      section('radian-applications','Arc length and speed',[
        {id:'radian-app',type:'paragraph',text:'Radian measure connects angular motion to distance. Angular speed is $\\omega=\\theta/t$, and linear speed is $v=r\\omega$ for circular motion.'},
        {id:'speed-formula',type:'formula',latex:'v=r\\omega,\\qquad\\omega=\\frac{\\theta}{t}'},
        {id:'speed-ex',type:'worked-example',title:'Instrument pointer movement',problem:'A pointer tip is 5 cm from its pivot. It rotates through 0.8 rad. How far does its tip travel?',steps:['Use the arc-length relation $s=r\\theta$.','Substitute $r=5$ cm and $\\theta=0.8$ rad.','$s=5(0.8)=4$ cm.'],check:'The dimensions of $r\\theta$ are distance because radians are dimensionless.',takeaway:'For arc-length calculations, convert angles to radians first.'},
        {id:'rad-src',type:'note',text:'Reference guide: Lial, Trigonometry 10th ed., §3.1–3.4; Schaum’s Outline of Trigonometry 4th ed., Chapter 1; Kelley, Humongous Book, Chapter 1.'},
      ]),
    ]
  },
  'trig-right-triangles-six-trigonometric-ratios': {
    id:'trig-right-triangles-six-trigonometric-ratios',title:'Six Trigonometric Ratios',summary:'Identify opposite, adjacent and hypotenuse sides and evaluate all six functions.',status:'draft',contentVersion:1,
    sections:[
      section('ratios-definition','Right-triangle side relationships',[
        {id:'ratio-intro',type:'definition',text:'Relative to an acute angle $\\theta$ of a right triangle: the opposite side faces $\\theta$, the adjacent side touches $\\theta$ but is not the hypotenuse, and the hypotenuse lies opposite the right angle.'},
        {id:'triangle-diagram',type:'diagram',diagram:'right-triangle',caption:'A 3–4–5 right triangle relative to the acute angle theta at the lower-left vertex.'},
        {id:'ratio-primary',type:'formula',latex:'\\sin\\theta=\\frac{\\text{opposite}}{\\text{hypotenuse}},\\quad\\cos\\theta=\\frac{\\text{adjacent}}{\\text{hypotenuse}},\\quad\\tan\\theta=\\frac{\\text{opposite}}{\\text{adjacent}}'},
        {id:'ratio-secondary',type:'formula',latex:'\\csc\\theta=\\frac{1}{\\sin\\theta},\\quad\\sec\\theta=\\frac{1}{\\cos\\theta},\\quad\\cot\\theta=\\frac{1}{\\tan\\theta}',description:'The reciprocal expressions are defined only when their denominators are nonzero.'},
        {id:'ratio-note',type:'note',text:'SOH–CAH–TOA is useful for sine, cosine, and tangent. The other three ratios are their reciprocals. Side roles change when you select the other acute angle.'},
        {id:'ratio-cp',type:'checkpoint',prompt:'In a 3–4–5 triangle, if the opposite side is 3 and adjacent is 4, find $\\tan\\theta$.',answer:'$3/4$.',explanation:'Divide opposite by adjacent.'},
      ]),
      section('ratios-evaluation','Find all six ratios',[
        {id:'ratio-ex1',type:'worked-example',title:'All six ratios for a 5–12–13 triangle',problem:'The opposite leg is 5, adjacent leg is 12, and hypotenuse is 13. Find all six ratios.',steps:['Use $\\sin\\theta=5/13$, $\\cos\\theta=12/13$, and $\\tan\\theta=5/12$.','Take reciprocals: $\\csc\\theta=13/5$, $\\sec\\theta=13/12$, and $\\cot\\theta=12/5$.'],check:'$\\sin^2\\theta+\\cos^2\\theta=25/169+144/169=1$.'},
        {id:'ratio-ex2',type:'worked-example',title:'Recover a missing side',problem:'For acute $\\theta$, $\\sin\\theta=8/17$. Find $\\tan\\theta$.',steps:['Interpret opposite $=8$ and hypotenuse $=17$.','Use Pythagoras: adjacent $=\\sqrt{17^2-8^2}=15$.','Thus $\\tan\\theta=8/15$.'],check:'The positive sides 8,15,17 satisfy $8^2+15^2=17^2$.'},
        {id:'ratio-cp2',type:'checkpoint',prompt:'If $\\cos\\theta=4/5$ for acute theta, what is $\\sec\\theta$?',answer:'$5/4$.',explanation:'Secant is the reciprocal of cosine.'},
      ]),
      section('ratios-applications','Choosing a ratio and avoiding mistakes',[
        {id:'ratio-app1',type:'worked-example',title:'Find the height of a support',problem:'A 10 m brace makes a 30° angle with level ground. Find its vertical height.',strategy:'Height is opposite; brace is hypotenuse, so use sine.',steps:['Use $\\sin30^\\circ=h/10$.','Since $\\sin30^\\circ=1/2$, $h=10(1/2)=5$ m.'],check:'The height is less than the 10 m brace, as expected.'},
        {id:'ratio-warning',type:'note',text:'Do not confuse $\\tan\\theta$ with $\\tan^{-1}\\theta$: the latter commonly denotes inverse tangent, not reciprocal cotangent. Use $\\cot\\theta$ for the reciprocal.'},
        {id:'ratio-src',type:'note',text:'Reference guide: Young, Trigonometry 3rd ed., Chapter 1; Lial, Trigonometry 10th ed., §2.1; Schaum’s Outline 4th ed., Chapter 3; Kelley, Chapter 2.'},
      ])
    ]
  },
  'trig-unit-circle-unit-circle-definitions': {
    id:'trig-unit-circle-unit-circle-definitions',title:'Unit-Circle Definitions',summary:'Read sine and cosine as coordinates and determine where tangent is undefined.',status:'draft',contentVersion:1,
    sections:[
      section('circle-definition','Circular functions as coordinates',[
        {id:'circle-def',type:'definition',text:'On the unit circle $x^2+y^2=1$, the terminal side of an angle $\\theta$ meets the circle at $(x,y)=(\\cos\\theta,\\sin\\theta)$.'},
        {id:'circle-picture',type:'diagram',diagram:'unit-circle',caption:'For 45° (pi/4), both circle coordinates are sqrt(2)/2.'},
        {id:'circle-formula',type:'formula',latex:'(x,y)=(\\cos\\theta,\\sin\\theta),\\qquad x^2+y^2=1'},
        {id:'circle-tangent',type:'formula',latex:'\\tan\\theta=\\frac{y}{x}=\\frac{\\sin\\theta}{\\cos\\theta}\\quad(x\\neq 0)'},
        {id:'circle-cp',type:'checkpoint',prompt:'What are $\\cos 0$ and $\\sin 0$?',answer:'1 and 0, respectively.',explanation:'At 0°, the terminal point is (1,0).'},
      ]),
      section('circle-quadrants','Quadrants, exact values and signs',[
        {id:'circle-para',type:'paragraph',text:'Cosine is the horizontal coordinate; sine is the vertical coordinate. Thus the signs of sine and cosine follow the signs of y and x in each quadrant.'},
        {id:'circle-ex1',type:'worked-example',title:'Second-quadrant coordinates',problem:'An angle has terminal point $(-3/5,4/5)$ on the unit circle. Find sine, cosine, and tangent.',steps:['Read $\\cos\\theta=x=-3/5$ and $\\sin\\theta=y=4/5$.','Compute $\\tan\\theta=(4/5)/(-3/5)=-4/3$.'],check:'$(-3/5)^2+(4/5)^2=1$, and the tangent sign is negative in quadrant II.'},
        {id:'circle-ex2',type:'worked-example',title:'A standard-angle point',problem:'Find the unit-circle coordinates at $\\theta=\\pi/3$.',steps:['$\\pi/3$ radians equals 60°.','The point is $(\\cos60^\\circ,\\sin60^\\circ)=(1/2,\\sqrt3/2)$.'],check:'$1/4+3/4=1$.'},
        {id:'circle-note',type:'note',text:'At 90° and 270°, cosine is zero, so tangent and secant are undefined. Do not assign them arbitrarily large finite values.'},
      ]),
      section('circle-applications','Unit circle and periodic rotation',[
        {id:'circle-period',type:'formula',latex:'\\sin(\\theta+2\\pi k)=\\sin\\theta,\\quad\\cos(\\theta+2\\pi k)=\\cos\\theta\\qquad(k\\in\\mathbb{Z})'},
        {id:'circle-app',type:'worked-example',title:'Reduce a rotation',problem:'Find $\\cos(5\\pi/2)$.',steps:['Subtract one full revolution: $5\\pi/2-2\\pi=\\pi/2$.','Read the unit-circle x-coordinate at $\\pi/2$: $\\cos(\\pi/2)=0$.'],check:'A 450° rotation shares its terminal ray with 90°.'},
        {id:'circle-src',type:'note',text:'Reference guide: Sullivan, Trigonometry 9th ed., §2.2–2.3; Lial, Trigonometry 10th ed., §3.3; Kelley, Chapter 3.'},
      ])
    ]
  },
  'trig-basic-identities-pythagorean-identities': {
    id:'trig-basic-identities-pythagorean-identities',title:'Pythagorean Trigonometric Identities',summary:'Derive, use and verify the three Pythagorean identities with proper domain restrictions.',status:'draft',contentVersion:1,
    sections:[
      section('identities-base','The three Pythagorean identities',[
        {id:'iden-intro',type:'definition',text:'Because the point $(\\cos\\theta,\\sin\\theta)$ lies on the unit circle, its coordinates satisfy the Pythagorean equation. Dividing by squared sine or cosine yields additional identities only when the divisor is nonzero.'},
        {id:'iden-one',type:'formula',latex:'\\sin^2\\theta+\\cos^2\\theta=1'},
        {id:'iden-two',type:'formula',latex:'1+\\tan^2\\theta=\\sec^2\\theta\\qquad(\\cos\\theta\\ne0)'},
        {id:'iden-three',type:'formula',latex:'1+\\cot^2\\theta=\\csc^2\\theta\\qquad(\\sin\\theta\\ne0)'},
        {id:'iden-note',type:'note',text:'For $\\sin^2\\theta$, square the value of sine. Do not mistake it for $\\sin(\\theta^2)$; and never divide by a trig function unless it is nonzero.'},
        {id:'iden-check',type:'checkpoint',prompt:'Complete: $1-\\sin^2\\theta=$ ?',answer:'$\\cos^2\\theta$.',explanation:'Rearrange the basic Pythagorean identity.'},
      ]),
      section('identities-transform','Simplify using the identities',[
        {id:'iden-ex1',type:'worked-example',title:'Replace a squared expression',problem:'Simplify $1-\\cos^2\\theta$.',steps:['Start with $\\sin^2\\theta+\\cos^2\\theta=1$.','Subtract $\\cos^2\\theta$ from both sides.','$1-\\cos^2\\theta=\\sin^2\\theta$.'],check:'Both expressions are 0 at theta = 0 and 1 at theta = pi/2.'},
        {id:'iden-ex2',type:'worked-example',title:'Reduce a rational expression',problem:'Simplify $(1-\\sin^2\\theta)/\\cos\\theta$ where $\\cos\\theta\\ne0$.',steps:['Substitute $1-\\sin^2\\theta=\\cos^2\\theta$.','Divide: $\\cos^2\\theta/\\cos\\theta=\\cos\\theta$.'],check:'The original is undefined where cosine is zero; retain that restriction in the simplified result.',takeaway:'Equivalent simplified expressions must have the same allowed domain as the original.'},
        {id:'iden-check2',type:'checkpoint',prompt:'Simplify $\\sec^2\\theta-\\tan^2\\theta$ wherever defined.',answer:'1.',explanation:'Rearrange $1+\\tan^2\\theta=\\sec^2\\theta$.'},
      ]),
      section('identities-applications','Find unknown trig values',[
        {id:'iden-ex3',type:'worked-example',title:'Find the cosine with quadrant information',problem:'Given $\\sin\\theta=3/5$ and theta is in quadrant II, find $\\cos\\theta$.',steps:['Use $\\cos^2\\theta=1-(3/5)^2=16/25$.','Therefore $\\cos\\theta=\\pm4/5$.','Cosine is negative in quadrant II, so $\\cos\\theta=-4/5$.'],check:'$9/25+16/25=1$, and the sign matches quadrant II.'},
        {id:'iden-caution',type:'note',text:'Square-rooting $\\cos^2\\theta=a$ gives $\\cos\\theta=\\pm\\sqrt a$. Use the specified quadrant or interval to select the correct sign.'},
        {id:'iden-src',type:'note',text:'Reference guide: Lial, Trigonometry 10th ed., §5.1–5.2; Schaum’s Outline 4th ed., Chapter 8; Kelley, Chapter 7; Young, Chapter 5.'},
      ])
    ]
  }
};
export const TRIGONOMETRY_PILOT_IDS = Object.keys(TRIGONOMETRY_PILOT_LESSONS);
