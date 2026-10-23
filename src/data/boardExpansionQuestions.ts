import type { MockExamQuestion } from '../types';

/**
 * v10.14 original, parameter-checked PRACTICE questions.
 * Two numeric variants share one question family: changing numbers is NOT
 * a new independently assessable competency. This is NOT a PRC TOS audit.
 * No third-party questions were transcribed.
 */
export type ExpansionArea = 'geas' | 'electronics' | 'est';
export type ExpansionFamily = {
  area: ExpansionArea;
  id: string;
  topic: string;
  cases: readonly [readonly number[], readonly number[]];
  ask: (values: readonly number[]) => string;
  solve: (values: readonly number[]) => number;
  formula: string;
  unit: string;
  method: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
};

const families: ExpansionFamily[] = [];
const add = (
  area: ExpansionArea, id: string, topic: string,
  a: readonly number[], b: readonly number[],
  ask: ExpansionFamily['ask'], solve: ExpansionFamily['solve'],
  formula: string, unit: string, method: string,
  difficulty: ExpansionFamily['difficulty'] = 'Medium',
): void => { families.push({ area, id, topic, cases: [a, b], ask, solve, formula, unit, method, difficulty }); };

// GEAS: physics, chemistry, mechanics, economy, thermal science, and materials.
add('geas','newton','Engineering Mechanics',[12,3],[18,4],
  ([m,a])=>`A ${m}-kg mass accelerates at ${a} m/s² on a frictionless surface. Find the net force.`,
  ([m,a])=>m*a,'F = ma','N','Multiply mass by acceleration.');
add('geas','kinetic-energy','Engineering Mechanics',[8,5],[10,6],
  ([m,v])=>`A body of mass ${m} kg moves at ${v} m/s. Find its kinetic energy.`,
  ([m,v])=>m*v*v/2,'K = mv²/2','J','Apply the kinetic-energy formula.');
add('geas','mechanical-power','Physics for Engineers',[1200,30],[1800,45],
  ([w,t])=>`A machine performs ${w} joules of useful work in ${t} seconds. What is the average power?`,
  ([w,t])=>w/t,'P = W/t','W','Divide work by time.');
add('geas','hydrostatic-pressure','Fluid Mechanics',[1000,5],[1000,8],
  ([rho,h])=>`Find the gauge pressure in kPa at depth ${h} m in a fluid of density ${rho} kg/m³. Take g = 9.81 m/s².`,
  ([rho,h])=>rho*9.81*h/1000,'p = ρgh','kPa','Convert pascals to kilopascals.');
add('geas','boyle','Thermodynamics',[200,3,5],[150,4,6],
  ([p,v1,v2])=>`An ideal gas at constant temperature has pressure ${p} kPa and volume ${v1} L. Find its pressure when the volume is ${v2} L.`,
  ([p,v1,v2])=>p*v1/v2,'P₁V₁ = P₂V₂','kPa','Use Boyle’s law at constant temperature.');
add('geas','sensible-heat','Thermodynamics',[2,4200,5],[3,4200,4],
  ([m,c,dt])=>`Find the heat in kJ needed to raise ${m} kg of a material with specific heat ${c} J/(kg·°C) by ${dt} °C.`,
  ([m,c,dt])=>m*c*dt/1000,'Q = mcΔT','kJ','Multiply mass, specific heat, and temperature rise.');
add('geas','stress','Strength of Materials',[12000,0.004],[18000,0.006],
  ([force,area])=>`A bar is subjected to axial force ${force} N over ${area} m². Find normal stress in MPa.`,
  ([force,area])=>force/area/1e6,'σ = F/A','MPa','Divide axial force by area and convert Pa to MPa.');
add('geas','strain','Strength of Materials',[2,0.004],[4,0.006],
  ([length,change])=>`A specimen of original length ${length} m elongates ${change} m. Determine its engineering strain in percent.`,
  ([length,change])=>100*change/length,'ε = ΔL/L','%','Engineering strain is dimensionless; multiply by 100 for percent.');
add('geas','efficiency','Engineering Energy Systems',[1500,2000],[2700,3000],
  ([output,input])=>`A motor delivers ${output} W useful output while drawing ${input} W. Find its efficiency.`,
  ([output,input])=>100*output/input,'η = Pout/Pin','%','Efficiency is useful output divided by input.');
add('geas','simple-interest','Engineering Economics',[20000,0.06,3],[30000,0.05,4],
  ([p,r,t])=>`Find simple interest in pesos on ₱${p} at ${(r*100)}% per year for ${t} years.`,
  ([p,r,t])=>p*r*t,'I = Prt','PHP','Use annual simple interest, not compound interest.');
add('geas','present-value','Engineering Economics',[12100,0.1,2],[13310,0.1,3],
  ([future,r,n])=>`What present amount in pesos grows to ₱${future} in ${n} years at ${r*100}% compounded annually?`,
  ([future,r,n])=>future/(1+r)**n,'PV = FV/(1+i)ⁿ','PHP','Discount the future value by the compound factor.');
add('geas','density','Properties of Materials',[540,0.2],[780,0.3],
  ([m,v])=>`A sample has mass ${m} kg and volume ${v} m³. Calculate density.`,
  ([m,v])=>m/v,'ρ = m/V','kg/m³','Mass per unit volume gives density.');
add('geas','moles','Engineering Chemistry',[36,18],[44,44],
  ([mass,molar])=>`A substance has mass ${mass} g and molar mass ${molar} g/mol. How many moles are present?`,
  ([mass,molar])=>mass/molar,'n = m/M','mol','Divide sample mass by molar mass.');
add('geas','molarity','Engineering Chemistry',[2,4],[3,2],
  ([mol,vol])=>`A solution contains ${mol} mol of solute in ${vol} L of solution. Find molarity.`,
  ([mol,vol])=>mol/vol,'M = n/V','mol/L','Use total solution volume in liters.');
add('geas','acidity','Engineering Chemistry',[3],[5],
  ([power])=>`A dilute aqueous solution has hydrogen-ion concentration 10^(-${power}) mol/L. Calculate pH (ideal dilute solution at 25 °C).`,
  ([power])=>power,'pH = −log₁₀[H⁺]','pH','The negative exponent becomes the pH.');
add('geas','projectile-height','Physics for Engineers',[20],[30],
  ([v])=>`A projectile is fired straight upward at ${v} m/s, neglecting air resistance. Find its maximum height above launch in meters using g = 10 m/s².`,
  ([v])=>v*v/20,'hmax = v₀²/(2g)','m','Set final vertical speed to zero.');

// Electronics Engineering: circuits, semiconductor devices, amplifier fundamentals.
add('electronics','divider','Circuit Analysis',[12,2000,4000],[15,3000,2000],
  ([vin,r1,r2])=>`Two resistors ${r1} Ω (top) and ${r2} Ω (bottom) form an unloaded voltage divider across ${vin} V. Find the voltage across the bottom resistor.`,
  ([vin,r1,r2])=>vin*r2/(r1+r2),'Vout = Vin·R₂/(R₁+R₂)','V','Use the unloaded resistive divider formula.');
add('electronics','series','Circuit Analysis',[470,680,150],[220,330,450],
  ([a,b,c])=>`What is the equivalent resistance of ${a} Ω, ${b} Ω, and ${c} Ω connected in series?`,
  ([a,b,c])=>a+b+c,'Req = R₁ + R₂ + R₃','Ω','Add all series resistances.');
add('electronics','parallel','Circuit Analysis',[100,100],[200,300],
  ([r1,r2])=>`Find the equivalent resistance of ${r1} Ω and ${r2} Ω in parallel.`,
  ([r1,r2])=>r1*r2/(r1+r2),'Req = R₁R₂/(R₁+R₂)','Ω','Use the product-over-sum rule for two parallel resistors.');
add('electronics','rc-time','Transient Circuits',[10000,100],[22000,220],
  ([r,c])=>`Find the RC time constant in milliseconds for a ${r} Ω resistor and a ${c} µF capacitor.`,
  ([r,c])=>r*c/1000,'τ = RC','ms','Convert microfarads to farads, then seconds to milliseconds.');
add('electronics','rl-time','Transient Circuits',[0.2,100],[0.5,200],
  ([l,r])=>`An RL series circuit has inductance ${l} H and resistance ${r} Ω. Find its time constant in milliseconds.`,
  ([l,r])=>1000*l/r,'τ = L/R','ms','Divide inductance by resistance.');
add('electronics','rc-cutoff','Filters',[10000,1],[20000,2],
  ([r,c])=>`What is the cutoff frequency (Hz) of a first-order RC low-pass filter with R = ${r} Ω and C = ${c} µF?`,
  ([r,c])=>1/(2*Math.PI*r*c*1e-6),'fc = 1/(2πRC)','Hz','Use the -3 dB corner frequency, with C in farads.');
add('electronics','inverting-amp','Operational Amplifiers',[1,10,2],[2,8,3],
  ([rin,rf,vin])=>`An ideal inverting op-amp has Rin = ${rin} kΩ, Rf = ${rf} kΩ, and input ${vin} V. Find output voltage assuming no saturation.`,
  ([rin,rf,vin])=>-rf*vin/rin,'Vout = −(Rf/Rin)Vin','V','An inverting amplifier has negative closed-loop gain.');
add('electronics','noninverting-amp','Operational Amplifiers',[1,4,2],[2,6,1.5],
  ([rg,rf,vin])=>`An ideal non-inverting op-amp uses Rg = ${rg} kΩ and Rf = ${rf} kΩ, with input ${vin} V. Find output (unsaturated).`,
  ([rg,rf,vin])=>(1+rf/rg)*vin,'Vout = (1+Rf/Rg)Vin','V','The ideal closed-loop gain is 1+Rf/Rg.');
add('electronics','bjt-beta','BJT Circuits',[100,0.05],[150,0.04],
  ([beta,ib])=>`A BJT operating in forward active mode has β = ${beta} and base current ${ib} mA. Find collector current in mA.`,
  ([beta,ib])=>beta*ib,'Ic = βIb','mA','Multiply base current by current gain.');
add('electronics','transistor-power','Semiconductor Devices',[5,0.2],[10,0.1],
  ([v,i])=>`A transistor dissipates power with VCE = ${v} V and IC = ${i} A, neglecting base power. Find collector dissipation.`,
  ([v,i])=>v*i,'P ≈ VCE·IC','W','Multiply collector-emitter voltage and collector current.');
add('electronics','diode-resistor','Diode Circuits',[12,1000,0.7],[9,1000,0.7],
  ([supply,r,drop])=>`A ${supply} V source drives a silicon diode modeled by ${drop} V forward drop and a ${r} Ω series resistor. Find the diode current in mA.`,
  ([supply,r,drop])=>1000*(supply-drop)/r,'I = (VS−VD)/R','mA','Apply KVL using the constant-drop diode model.');
add('electronics','rms-sine','AC Circuit Fundamentals',[14.1421],[28.2843],
  ([peak])=>`A sinusoidal voltage has peak value ${peak} V. Find its RMS voltage, assuming an ideal sine wave.`,
  ([peak])=>peak/Math.sqrt(2),'Vrms = Vpeak/√2','V','The sine-wave RMS factor is 1/√2.');
add('electronics','led-resistor','LED Driver Design',[5,2,15],[12,3,20],
  ([source,led,mA])=>`An LED with ${led} V forward drop operates from ${source} V at ${mA} mA. Determine series resistance (Ω).`,
  ([source,led,mA])=>1000*(source-led)/mA,'R = (VS−VLED)/I','Ω','Convert current from milliamperes to amperes.');
add('electronics','adc-step','Mixed-Signal Electronics',[5,10],[3.3,8],
  ([vref,bits])=>`An ideal ${bits}-bit unipolar ADC spans 0 to ${vref} V. Find its ideal LSB size in mV using Vref/2^N.`,
  ([vref,bits])=>1000*vref/(2**bits),'LSB = Vref/2ᴺ','mV','Use 2^N quantization steps, not 2^N−1 codes.');
add('electronics','ripple-frequency','Power Supplies',[50],[60],
  ([line])=>`A full-wave rectifier is driven by ${line} Hz mains. Find the ripple repetition frequency.`,
  ([line])=>2*line,'fripple = 2fline','Hz','A full-wave rectifier has two ripple peaks per input cycle.');
add('electronics','coulomb-charge','Circuit Fundamentals',[2.5,20],[3,15],
  ([amps,seconds])=>`A constant current of ${amps} A flows for ${seconds} s. Find transported charge in coulombs.`,
  ([amps,seconds])=>amps*seconds,'Q = It','C','Charge equals current times duration.');

// EST: analog/digital communications, propagation, networking, optical links.
add('est','nyquist-sampling','Signals and Sampling',[3000],[5000],
  ([f])=>`A baseband signal contains frequencies up to ${f} Hz. Find its ideal minimum Nyquist sample rate (Hz).`,
  ([f])=>2*f,'fs ≥ 2fmax','Hz','Double the highest frequency, assuming an ideal band-limited signal.');
add('est','pcm-bitrate','Digital Communications',[8000,8],[16000,10],
  ([samples,bits])=>`PCM uses ${samples} samples/s and ${bits} bits/sample for one channel. What is its raw bit rate in kb/s?`,
  ([samples,bits])=>samples*bits/1000,'Rb = fs·n','kb/s','Multiply sample rate by bits per sample.');
add('est','wavelength','Antennas and Propagation',[100],[150],
  ([mhz])=>`An electromagnetic wave travels in free space at 3×10^8 m/s. Find wavelength (m) for ${mhz} MHz.`,
  ([mhz])=>300/mhz,'λ = c/f','m','Convert MHz to Hz before dividing wave speed by frequency.');
add('est','quarterwave','Antennas',[100],[150],
  ([mhz])=>`Using free-space wavelength (no velocity factor), find the approximate quarter-wave monopole length for ${mhz} MHz.`,
  ([mhz])=>75/mhz,'L = c/(4f)','m','A quarter wavelength is λ/4.');
add('est','shannon','Digital Communications',[3000,15],[4000,7],
  ([b,snr])=>`An ideal channel has bandwidth ${b} Hz and LINEAR signal-to-noise ratio ${snr} (not dB). Find Shannon capacity in kb/s.`,
  ([b,snr])=>b*Math.log2(1+snr)/1000,'C = B log₂(1+S/N)','kb/s','Use a linear SNR, not decibels, inside log₂.');
add('est','power-gain','Transmission and Link Budgets',[10],[100],
  ([ratio])=>`Received power is ${ratio} times reference power. What is the power ratio in decibels?`,
  ([ratio])=>10*Math.log10(ratio),'GdB = 10log₁₀(P₂/P₁)','dB','Use 10 log for power ratios.');
add('est','qam-bits','Digital Modulation',[16],[64],
  ([states])=>`How many bits are carried by one symbol of ideal ${states}-QAM?`,
  ([states])=>Math.log2(states),'bits/symbol = log₂(M)','bits/symbol','Count the bits needed to address M constellation points.');
add('est','propagation-delay','Propagation and Networks',[600,2e8],[900,2e8],
  ([km,speed])=>`A signal propagates ${km} km in a cable at ${speed} m/s. Find one-way delay in milliseconds, excluding processing time.`,
  ([km,speed])=>1e6*km/speed,'t = d/v','ms','Convert distance from km to m and seconds to milliseconds.');
add('est','am-bandwidth','Analog Modulation',[4000],[6000],
  ([audio])=>`An AM double-sideband full-carrier signal has maximum audio frequency ${audio} Hz. Find occupied bandwidth in kHz.`,
  ([audio])=>2*audio/1000,'BW = 2fm','kHz','Conventional AM uses upper and lower sidebands.');
add('est','carson','FM Systems',[50,10],[75,15],
  ([deviation,mod])=>`Estimate FM transmission bandwidth (kHz) using Carson’s rule when peak deviation is ${deviation} kHz and maximum modulating frequency is ${mod} kHz.`,
  ([deviation,mod])=>2*(deviation+mod),'BW ≈ 2(Δf+fm)','kHz','Carson’s rule approximates significant FM sideband bandwidth.');
add('est','baudrate','Digital Modulation',[9600,16],[12000,64],
  ([bitsPerSec,M])=>`An uncoded ${M}-ary modulation transmits ${bitsPerSec} information bits/s with one symbol per signaling interval. Find symbol rate (baud).`,
  ([bitsPerSec,M])=>bitsPerSec/Math.log2(M),'Rs = Rb/log₂(M)','baud','Divide bit rate by bits per symbol.');
add('est','bit-duration','Digital Transmission',[2000],[5000],
  ([rate])=>`What is the bit interval in milliseconds for a serial stream at ${rate} bits per second?`,
  ([rate])=>1000/rate,'Tb = 1/Rb','ms','Invert the data rate and convert to milliseconds.');
add('est','fiber-delay','Fiber Optic Systems',[100,2e8],[200,2e8],
  ([km,v])=>`An optical signal travels ${km} km through a fiber with group velocity ${v} m/s. Find one-way propagation delay in milliseconds.`,
  ([km,v])=>1e6*km/v,'t = d/v','ms','Use group velocity through the fiber, not vacuum speed.');
add('est','channel-spacing','Frequency Division Multiplexing',[10,200],[8,250],
  ([count,width])=>`A simple FDM allocation uses ${count} nonoverlapping channels, each ${width} kHz wide, with no guard bands. What total spectrum width in MHz is required?`,
  ([count,width])=>count*width/1000,'BWtotal = N·BWchannel','MHz','Add channel bandwidths and convert kHz to MHz.');
add('est','packet-efficiency','Data Communications',[1000,100],[1500,300],
  ([payload,overhead])=>`A network frame transports ${payload} payload bytes plus ${overhead} overhead bytes. Find payload efficiency as a percent.`,
  ([payload,overhead])=>100*payload/(payload+overhead),'η = payload/total','%','Count both payload and overhead in total transmitted bytes.');
add('est','attenuation','Optical Link Budgets',[0.2,10],[0.3,20],
  ([alpha,distance])=>`A fiber has attenuation ${alpha} dB/km over ${distance} km, excluding connector losses. Find total attenuation in dB.`,
  ([alpha,distance])=>alpha*distance,'L = αd','dB','Multiply loss per kilometer by link distance.');

export const BOARD_EXPANSION_FAMILIES: readonly ExpansionFamily[] = families;

const subjectInfo: Record<ExpansionArea, {subjectId:string;subjectName:string}> = {
  geas:{subjectId:'subj-geas',subjectName:'General Engineering and Applied Sciences'},
  electronics:{subjectId:'subj-electronics',subjectName:'Electronics Engineering'},
  est:{subjectId:'subj-communications',subjectName:'Electronics Systems and Technologies'},
};

const pretty = (value:number):string => {
  if(!Number.isFinite(value)) throw new Error('Non-finite authored answer');
  // Five significant figures preserve distinct numerical options for these cases.
  return String(Number(value.toPrecision(5)));
};

/** Stable answer IDs survive reshuffling; choices deliberately have varied key positions. */
function expandFamily(f: ExpansionFamily, caseNumber: number): MockExamQuestion {
  const values=f.cases[caseNumber];
  const value=f.solve(values);
  const valuesOfOptions=[value,value*1.25,value*0.75,value*1.5];
  const descriptions=valuesOfOptions.map(n=>`${pretty(n)} ${f.unit}`);
  if(new Set(descriptions).size!==4) throw new Error(`Ambiguous choices: ${f.id}`);
  const offset=(Array.from(f.id).reduce((sum,c)=>sum+c.charCodeAt(0),caseNumber)+caseNumber*7)%4;
  const correctOptionId=['A','B','C','D'][offset];
  const options=['A','B','C','D'].map((id,i)=>({id,text:descriptions[(i-offset+4)%4]}));
  const subject=subjectInfo[f.area];
  const familyName=f.id.split('-').map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ');
  return {
    id:`v1014-${f.area}-${f.id}-${caseNumber+1}`,
    subjectId:subject.subjectId,subjectName:subject.subjectName,
    topicId:`top-v1014-${f.area}-${f.id}`, topicName:`${f.topic} — ${familyName}`,
    question:f.ask(values), options, correctOptionId,
    explanation:`${f.method} ${f.formula}. Substitution gives ${pretty(value)} ${f.unit}.`,
    keyFormula:f.formula,
    boardTip:'Original numeric practice variant; a changed set of numbers is not an independent problem family.',
    difficulty:f.difficulty ?? 'Medium',
    questionFamilyId:`v1014-${f.area}-${f.id}`,
    calculatorInputs:{schemaVersion:1, familyId:`v1014-${f.area}-${f.id}`,values:[...values],unit:f.unit},

    contentOrigin:'original-v10.14',
  };
}
export const BOARD_EXPANSION_QUESTIONS: MockExamQuestion[] = families.flatMap(f=>[expandFamily(f,0),expandFamily(f,1)]);
