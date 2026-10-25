/** Original unapproved practice items. Do not insert into certified PRC examination pools. */
export type CalculusCognitive='knowledge'|'comprehension'|'application'|'analysis';
export interface CalculusQuestion {id:string;moduleId:string;prompt:string;options:string[];correctIndex:number;explanation:string;cognitive:CalculusCognitive;reviewStatus:'draft';sourceType:'original';}
export const CALCULUS_QUESTIONS:CalculusQuestion[]=[
  {
    "id": "dc01-q01",
    "moduleId": "DC01",
    "prompt": "lim as x→2 of (x²−4)/(x−2)",
    "options": [
      "4",
      "5",
      "3",
      "6"
    ],
    "correctIndex": 0,
    "explanation": "Cancel (x−2) for x≠2, then evaluate x+2 at x=2: 4.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q02",
    "moduleId": "DC01",
    "prompt": "lim as x→3 of (x²−9)/(x−3)",
    "options": [
      "7",
      "5",
      "8",
      "6"
    ],
    "correctIndex": 3,
    "explanation": "Cancel (x−3) for x≠3, then evaluate x+3 at x=3: 6.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q03",
    "moduleId": "DC01",
    "prompt": "lim as x→4 of (x²−16)/(x−4)",
    "options": [
      "7",
      "10",
      "8",
      "9"
    ],
    "correctIndex": 2,
    "explanation": "Cancel (x−4) for x≠4, then evaluate x+4 at x=4: 8.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q04",
    "moduleId": "DC01",
    "prompt": "lim as x→2 of (2x²+1)",
    "options": [
      "11",
      "9",
      "10",
      "8"
    ],
    "correctIndex": 1,
    "explanation": "The polynomial is continuous, so substitution gives 9.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q05",
    "moduleId": "DC01",
    "prompt": "lim as x→3 of (2x²+1)",
    "options": [
      "19",
      "20",
      "18",
      "21"
    ],
    "correctIndex": 0,
    "explanation": "The polynomial is continuous, so substitution gives 19.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q06",
    "moduleId": "DC01",
    "prompt": "lim as x→4 of (2x²+1)",
    "options": [
      "34",
      "32",
      "35",
      "33"
    ],
    "correctIndex": 3,
    "explanation": "The polynomial is continuous, so substitution gives 33.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q07",
    "moduleId": "DC01",
    "prompt": "lim as x→0+ of |x|/x",
    "options": [
      "0",
      "does not exist",
      "1",
      "−1"
    ],
    "correctIndex": 2,
    "explanation": "For positive x the quotient equals 1, and for negative x it equals −1. The two-sided limit does not exist.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q08",
    "moduleId": "DC01",
    "prompt": "lim as x→0− of |x|/x",
    "options": [
      "does not exist",
      "−1",
      "1",
      "0"
    ],
    "correctIndex": 1,
    "explanation": "For positive x the quotient equals 1, and for negative x it equals −1. The two-sided limit does not exist.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc01-q09",
    "moduleId": "DC01",
    "prompt": "lim as x→0 of |x|/x",
    "options": [
      "does not exist",
      "1",
      "−1",
      "0"
    ],
    "correctIndex": 0,
    "explanation": "For positive x the quotient equals 1, and for negative x it equals −1. The two-sided limit does not exist.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q01",
    "moduleId": "DC02",
    "prompt": "If f(x)=1x³, what is f'(2)?",
    "options": [
      "13",
      "11",
      "14",
      "12"
    ],
    "correctIndex": 3,
    "explanation": "f'(x)=3x², so f'(2)=12.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q02",
    "moduleId": "DC02",
    "prompt": "If f(x)=2x³, what is f'(2)?",
    "options": [
      "23",
      "26",
      "24",
      "25"
    ],
    "correctIndex": 2,
    "explanation": "f'(x)=6x², so f'(2)=24.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q03",
    "moduleId": "DC02",
    "prompt": "If f(x)=3x³, what is f'(2)?",
    "options": [
      "38",
      "36",
      "37",
      "35"
    ],
    "correctIndex": 1,
    "explanation": "f'(x)=9x², so f'(2)=36.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q04",
    "moduleId": "DC02",
    "prompt": "Derivative at x=1 of y=(x²+1)(2x)",
    "options": [
      "8",
      "9",
      "7",
      "10"
    ],
    "correctIndex": 0,
    "explanation": "Expand: y=2x³+2x; y'(1)=6+2=8.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q05",
    "moduleId": "DC02",
    "prompt": "Derivative at x=1 of y=(x²+1)(3x)",
    "options": [
      "13",
      "11",
      "14",
      "12"
    ],
    "correctIndex": 3,
    "explanation": "Expand: y=3x³+3x; y'(1)=9+3=12.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q06",
    "moduleId": "DC02",
    "prompt": "Derivative at x=1 of y=(x²+1)(4x)",
    "options": [
      "15",
      "18",
      "16",
      "17"
    ],
    "correctIndex": 2,
    "explanation": "Expand: y=4x³+4x; y'(1)=12+4=16.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q07",
    "moduleId": "DC02",
    "prompt": "For y=(x²+2)², find y'(1).",
    "options": [
      "14",
      "12",
      "13",
      "11"
    ],
    "correctIndex": 1,
    "explanation": "Chain rule: y'=4x(x²+2) and y'(1)=12.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q08",
    "moduleId": "DC02",
    "prompt": "For y=(x²+3)², find y'(1).",
    "options": [
      "16",
      "17",
      "15",
      "18"
    ],
    "correctIndex": 0,
    "explanation": "Chain rule: y'=4x(x²+3) and y'(1)=16.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc02-q09",
    "moduleId": "DC02",
    "prompt": "For y=(x²+4)², find y'(1).",
    "options": [
      "21",
      "19",
      "22",
      "20"
    ],
    "correctIndex": 3,
    "explanation": "Chain rule: y'=4x(x²+4) and y'(1)=20.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q01",
    "moduleId": "DC03",
    "prompt": "For f(x)=2x³, compute f''(1).",
    "options": [
      "11",
      "14",
      "12",
      "13"
    ],
    "correctIndex": 2,
    "explanation": "Twice differentiate to obtain f''=6(2)x; evaluate x=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q02",
    "moduleId": "DC03",
    "prompt": "For f(x)=3x³, compute f''(1).",
    "options": [
      "20",
      "18",
      "19",
      "17"
    ],
    "correctIndex": 1,
    "explanation": "Twice differentiate to obtain f''=6(3)x; evaluate x=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q03",
    "moduleId": "DC03",
    "prompt": "For f(x)=4x³, compute f''(1).",
    "options": [
      "24",
      "25",
      "23",
      "26"
    ],
    "correctIndex": 0,
    "explanation": "Twice differentiate to obtain f''=6(4)x; evaluate x=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q04",
    "moduleId": "DC03",
    "prompt": "Given s(t)=2t²+t, compute velocity at t=2.",
    "options": [
      "10",
      "8",
      "11",
      "9"
    ],
    "correctIndex": 3,
    "explanation": "s'(t)=4t+1; at t=2 gives 9.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q05",
    "moduleId": "DC03",
    "prompt": "Given s(t)=3t²+t, compute velocity at t=2.",
    "options": [
      "12",
      "15",
      "13",
      "14"
    ],
    "correctIndex": 2,
    "explanation": "s'(t)=6t+1; at t=2 gives 13.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q06",
    "moduleId": "DC03",
    "prompt": "Given s(t)=4t²+t, compute velocity at t=2.",
    "options": [
      "19",
      "17",
      "18",
      "16"
    ],
    "correctIndex": 1,
    "explanation": "s'(t)=8t+1; at t=2 gives 17.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q07",
    "moduleId": "DC03",
    "prompt": "Given s(t)=2t²+t, compute acceleration.",
    "options": [
      "4",
      "5",
      "3",
      "6"
    ],
    "correctIndex": 0,
    "explanation": "Acceleration s''(t)=4.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q08",
    "moduleId": "DC03",
    "prompt": "Given s(t)=3t²+t, compute acceleration.",
    "options": [
      "7",
      "5",
      "8",
      "6"
    ],
    "correctIndex": 3,
    "explanation": "Acceleration s''(t)=6.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc03-q09",
    "moduleId": "DC03",
    "prompt": "Given s(t)=4t²+t, compute acceleration.",
    "options": [
      "7",
      "10",
      "8",
      "9"
    ],
    "correctIndex": 2,
    "explanation": "Acceleration s''(t)=8.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q01",
    "moduleId": "DC04",
    "prompt": "For x=t², y=2t³, calculate dy/dx at t=2.",
    "options": [
      "8",
      "6",
      "7",
      "5"
    ],
    "correctIndex": 1,
    "explanation": "dy/dx=(32t²)/(2t)=32t/2, giving 6 at t=2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q02",
    "moduleId": "DC04",
    "prompt": "For x=t², y=3t³, calculate dy/dx at t=2.",
    "options": [
      "9",
      "10",
      "8",
      "11"
    ],
    "correctIndex": 0,
    "explanation": "dy/dx=(33t²)/(2t)=33t/2, giving 9 at t=2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q03",
    "moduleId": "DC04",
    "prompt": "For x=t², y=4t³, calculate dy/dx at t=2.",
    "options": [
      "13",
      "11",
      "14",
      "12"
    ],
    "correctIndex": 3,
    "explanation": "dy/dx=(34t²)/(2t)=34t/2, giving 12 at t=2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q04",
    "moduleId": "DC04",
    "prompt": "For x=t, y=t²+3t, find dy/dx at t=1.",
    "options": [
      "4",
      "7",
      "5",
      "6"
    ],
    "correctIndex": 2,
    "explanation": "dy/dx=(2t+3)/1; at t=1 gives 5.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q05",
    "moduleId": "DC04",
    "prompt": "For x=t, y=t²+4t, find dy/dx at t=1.",
    "options": [
      "8",
      "6",
      "7",
      "5"
    ],
    "correctIndex": 1,
    "explanation": "dy/dx=(2t+4)/1; at t=1 gives 6.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q06",
    "moduleId": "DC04",
    "prompt": "For x=t, y=t²+5t, find dy/dx at t=1.",
    "options": [
      "7",
      "8",
      "6",
      "9"
    ],
    "correctIndex": 0,
    "explanation": "dy/dx=(2t+5)/1; at t=1 gives 7.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q07",
    "moduleId": "DC04",
    "prompt": "For x=t²+1, y=4t, find dy/dx at t=1.",
    "options": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correctIndex": 3,
    "explanation": "dy/dx=4/(2t); t=1 gives 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q08",
    "moduleId": "DC04",
    "prompt": "For x=t²+1, y=6t, find dy/dx at t=1.",
    "options": [
      "2",
      "5",
      "3",
      "4"
    ],
    "correctIndex": 2,
    "explanation": "dy/dx=6/(2t); t=1 gives 3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc04-q09",
    "moduleId": "DC04",
    "prompt": "For x=t²+1, y=8t, find dy/dx at t=1.",
    "options": [
      "6",
      "4",
      "5",
      "3"
    ],
    "correctIndex": 1,
    "explanation": "dy/dx=8/(2t); t=1 gives 4.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q01",
    "moduleId": "DC05",
    "prompt": "If f(x,y)=2x²y, find ∂f/∂x at (1,2).",
    "options": [
      "8",
      "9",
      "7",
      "10"
    ],
    "correctIndex": 0,
    "explanation": "Hold y fixed: f_x=4xy; substitute (1,2) to get 8.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q02",
    "moduleId": "DC05",
    "prompt": "If f(x,y)=3x²y, find ∂f/∂x at (1,2).",
    "options": [
      "13",
      "11",
      "14",
      "12"
    ],
    "correctIndex": 3,
    "explanation": "Hold y fixed: f_x=6xy; substitute (1,2) to get 12.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q03",
    "moduleId": "DC05",
    "prompt": "If f(x,y)=4x²y, find ∂f/∂x at (1,2).",
    "options": [
      "15",
      "18",
      "16",
      "17"
    ],
    "correctIndex": 2,
    "explanation": "Hold y fixed: f_x=8xy; substitute (1,2) to get 16.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q04",
    "moduleId": "DC05",
    "prompt": "If f=x²+2y², find ∂f/∂y at (1,1).",
    "options": [
      "6",
      "4",
      "5",
      "3"
    ],
    "correctIndex": 1,
    "explanation": "f_y=4y, which equals 4 at y=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q05",
    "moduleId": "DC05",
    "prompt": "If f=x²+3y², find ∂f/∂y at (1,1).",
    "options": [
      "6",
      "7",
      "5",
      "8"
    ],
    "correctIndex": 0,
    "explanation": "f_y=6y, which equals 6 at y=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q06",
    "moduleId": "DC05",
    "prompt": "If f=x²+4y², find ∂f/∂y at (1,1).",
    "options": [
      "9",
      "7",
      "10",
      "8"
    ],
    "correctIndex": 3,
    "explanation": "f_y=8y, which equals 8 at y=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q07",
    "moduleId": "DC05",
    "prompt": "For f=2xy+y³, find the mixed partial f_xy.",
    "options": [
      "1",
      "4",
      "2",
      "3"
    ],
    "correctIndex": 2,
    "explanation": "Differentiate first in x to obtain 2y, then in y to obtain 2.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q08",
    "moduleId": "DC05",
    "prompt": "For f=3xy+y³, find the mixed partial f_xy.",
    "options": [
      "5",
      "3",
      "4",
      "2"
    ],
    "correctIndex": 1,
    "explanation": "Differentiate first in x to obtain 3y, then in y to obtain 3.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "dc05-q09",
    "moduleId": "DC05",
    "prompt": "For f=4xy+y³, find the mixed partial f_xy.",
    "options": [
      "4",
      "5",
      "3",
      "6"
    ],
    "correctIndex": 0,
    "explanation": "Differentiate first in x to obtain 4y, then in y to obtain 4.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q01",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 1 of 2x dx.",
    "options": [
      "2",
      "0",
      "3",
      "1"
    ],
    "correctIndex": 3,
    "explanation": "The antiderivative is (2/2)x²; the result is 1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q02",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 1 of 4x dx.",
    "options": [
      "1",
      "4",
      "2",
      "3"
    ],
    "correctIndex": 2,
    "explanation": "The antiderivative is (4/2)x²; the result is 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q03",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 1 of 6x dx.",
    "options": [
      "5",
      "3",
      "4",
      "2"
    ],
    "correctIndex": 1,
    "explanation": "The antiderivative is (6/2)x²; the result is 3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q04",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 1 of 3x² dx.",
    "options": [
      "1",
      "2",
      "0",
      "3"
    ],
    "correctIndex": 0,
    "explanation": "The antiderivative is (3/3)x³; result 1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q05",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 1 of 6x² dx.",
    "options": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correctIndex": 3,
    "explanation": "The antiderivative is (6/3)x³; result 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q06",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 1 of 9x² dx.",
    "options": [
      "2",
      "5",
      "3",
      "4"
    ],
    "correctIndex": 2,
    "explanation": "The antiderivative is (9/3)x³; result 3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q07",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 2 of 2x dx.",
    "options": [
      "6",
      "4",
      "5",
      "3"
    ],
    "correctIndex": 1,
    "explanation": "The antiderivative x² gives 2²=4.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q08",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 3 of 2x dx.",
    "options": [
      "9",
      "10",
      "8",
      "11"
    ],
    "correctIndex": 0,
    "explanation": "The antiderivative x² gives 3²=9.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic01-q09",
    "moduleId": "IC01",
    "prompt": "Evaluate the definite integral from 0 to 4 of 2x dx.",
    "options": [
      "17",
      "15",
      "18",
      "16"
    ],
    "correctIndex": 3,
    "explanation": "The antiderivative x² gives 4²=16.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q01",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 4x(x²+1) dx.",
    "options": [
      "2",
      "5",
      "3",
      "4"
    ],
    "correctIndex": 2,
    "explanation": "Let u=x²+1, du=2x dx. Then 2∫ from 1 to 2 of u du=32/2=3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q02",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 8x(x²+1) dx.",
    "options": [
      "8",
      "6",
      "7",
      "5"
    ],
    "correctIndex": 1,
    "explanation": "Let u=x²+1, du=2x dx. Then 4∫ from 1 to 2 of u du=34/2=6.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q03",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 12x(x²+1) dx.",
    "options": [
      "9",
      "10",
      "8",
      "11"
    ],
    "correctIndex": 0,
    "explanation": "Let u=x²+1, du=2x dx. Then 6∫ from 1 to 2 of u du=36/2=9.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q04",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 2x exp(x) dx.",
    "options": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correctIndex": 3,
    "explanation": "Integration by parts gives ∫₀¹ x e^x dx=1; multiply by 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q05",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 3x exp(x) dx.",
    "options": [
      "2",
      "5",
      "3",
      "4"
    ],
    "correctIndex": 2,
    "explanation": "Integration by parts gives ∫₀¹ x e^x dx=1; multiply by 3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q06",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 4x exp(x) dx.",
    "options": [
      "6",
      "4",
      "5",
      "3"
    ],
    "correctIndex": 1,
    "explanation": "Integration by parts gives ∫₀¹ x e^x dx=1; multiply by 4.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q07",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 1/(x+1) dx.",
    "options": [
      "ln 2",
      "1 ln 3",
      "1/2",
      "1 ln 5"
    ],
    "correctIndex": 0,
    "explanation": "Antiderivative 1 ln|x+1|, evaluated 0 to 1, gives ln 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q08",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 2/(x+1) dx.",
    "options": [
      "2 ln 3",
      "2/2",
      "2 ln 5",
      "2 ln 2"
    ],
    "correctIndex": 3,
    "explanation": "Antiderivative 2 ln|x+1|, evaluated 0 to 1, gives 2 ln 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic02-q09",
    "moduleId": "IC02",
    "prompt": "Evaluate ∫ from 0 to 1 of 3/(x+1) dx.",
    "options": [
      "3/2",
      "3 ln 5",
      "3 ln 2",
      "3 ln 3"
    ],
    "correctIndex": 2,
    "explanation": "Antiderivative 3 ln|x+1|, evaluated 0 to 1, gives 3 ln 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q01",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 2 to infinity of x^(−2) dx.",
    "options": [
      "2",
      "1/2",
      "1/3",
      "1/4"
    ],
    "correctIndex": 1,
    "explanation": "The finite-endpoint integral 1/2−1/b tends to 1/2 as b→∞.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q02",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 3 to infinity of x^(−2) dx.",
    "options": [
      "1/3",
      "1/4",
      "1/5",
      "3"
    ],
    "correctIndex": 0,
    "explanation": "The finite-endpoint integral 1/3−1/b tends to 1/3 as b→∞.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q03",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 4 to infinity of x^(−2) dx.",
    "options": [
      "1/5",
      "1/6",
      "4",
      "1/4"
    ],
    "correctIndex": 3,
    "explanation": "The finite-endpoint integral 1/4−1/b tends to 1/4 as b→∞.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q04",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 0 to 1 of x^(−1/2) dx.",
    "options": [
      "1",
      "4",
      "2",
      "3"
    ],
    "correctIndex": 2,
    "explanation": "Use the lower one-sided limit and 1/(1−p); since p=1/2<1, the answer is 2.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q05",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 0 to 1 of x^(−2/3) dx.",
    "options": [
      "5",
      "3",
      "4",
      "2"
    ],
    "correctIndex": 1,
    "explanation": "Use the lower one-sided limit and 1/(1−p); since p=2/3<1, the answer is 3.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q06",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 0 to 1 of x^(−3/4) dx.",
    "options": [
      "4",
      "5",
      "3",
      "6"
    ],
    "correctIndex": 0,
    "explanation": "Use the lower one-sided limit and 1/(1−p); since p=3/4<1, the answer is 4.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q07",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 0 to infinity of 2 exp(−2x) dx.",
    "options": [
      "0",
      "2",
      "1/2",
      "1"
    ],
    "correctIndex": 3,
    "explanation": "The antiderivative is −exp(−2x); boundary evaluation yields 1.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q08",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 0 to infinity of 3 exp(−3x) dx.",
    "options": [
      "3",
      "1/3",
      "1",
      "0"
    ],
    "correctIndex": 2,
    "explanation": "The antiderivative is −exp(−3x); boundary evaluation yields 1.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic03-q09",
    "moduleId": "IC03",
    "prompt": "Evaluate ∫ from 0 to infinity of 4 exp(−4x) dx.",
    "options": [
      "1/4",
      "1",
      "0",
      "4"
    ],
    "correctIndex": 1,
    "explanation": "The antiderivative is −exp(−4x); boundary evaluation yields 1.",
    "cognitive": "comprehension",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q01",
    "moduleId": "IC04",
    "prompt": "Area under y=2x for 0≤x≤2",
    "options": [
      "4",
      "5",
      "3",
      "6"
    ],
    "correctIndex": 0,
    "explanation": "∫₀²2x dx=(2/2)·4=4.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q02",
    "moduleId": "IC04",
    "prompt": "Area under y=3x for 0≤x≤2",
    "options": [
      "7",
      "5",
      "8",
      "6"
    ],
    "correctIndex": 3,
    "explanation": "∫₀²3x dx=(3/2)·4=6.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q03",
    "moduleId": "IC04",
    "prompt": "Area under y=4x for 0≤x≤2",
    "options": [
      "7",
      "10",
      "8",
      "9"
    ],
    "correctIndex": 2,
    "explanation": "∫₀²4x dx=(4/2)·4=8.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q04",
    "moduleId": "IC04",
    "prompt": "Rotate y=1x, 0≤x≤1, about x-axis. Find volume.",
    "options": [
      "1π/4",
      "π/3",
      "1π",
      "1π/2"
    ],
    "correctIndex": 1,
    "explanation": "The disk method gives V=π∫₀¹(1x)² dx=1π/3.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q05",
    "moduleId": "IC04",
    "prompt": "Rotate y=2x, 0≤x≤1, about x-axis. Find volume.",
    "options": [
      "4π/3",
      "4π",
      "4π/2",
      "4π/4"
    ],
    "correctIndex": 0,
    "explanation": "The disk method gives V=π∫₀¹(2x)² dx=4π/3.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q06",
    "moduleId": "IC04",
    "prompt": "Rotate y=3x, 0≤x≤1, about x-axis. Find volume.",
    "options": [
      "9π",
      "9π/2",
      "9π/4",
      "9π/3"
    ],
    "correctIndex": 3,
    "explanation": "The disk method gives V=π∫₀¹(3x)² dx=9π/3.",
    "cognitive": "analysis",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q07",
    "moduleId": "IC04",
    "prompt": "Average value of y=3x² on [0,1]",
    "options": [
      "0",
      "3",
      "1",
      "2"
    ],
    "correctIndex": 2,
    "explanation": "Average value is (1/1)∫₀¹3x² dx=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q08",
    "moduleId": "IC04",
    "prompt": "Average value of y=6x² on [0,1]",
    "options": [
      "4",
      "2",
      "3",
      "1"
    ],
    "correctIndex": 1,
    "explanation": "Average value is (1/1)∫₀¹6x² dx=2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic04-q09",
    "moduleId": "IC04",
    "prompt": "Average value of y=9x² on [0,1]",
    "options": [
      "3",
      "4",
      "2",
      "5"
    ],
    "correctIndex": 0,
    "explanation": "Average value is (1/1)∫₀¹9x² dx=3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q01",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 2 dx dy.",
    "options": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correctIndex": 3,
    "explanation": "A constant 2 over a unit square integrates to 2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q02",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 3 dx dy.",
    "options": [
      "2",
      "5",
      "3",
      "4"
    ],
    "correctIndex": 2,
    "explanation": "A constant 3 over a unit square integrates to 3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q03",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 4 dx dy.",
    "options": [
      "6",
      "4",
      "5",
      "3"
    ],
    "correctIndex": 1,
    "explanation": "A constant 4 over a unit square integrates to 4.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q04",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 2x dx dy.",
    "options": [
      "1",
      "2",
      "0",
      "3"
    ],
    "correctIndex": 0,
    "explanation": "Integrate in x: 2/2. The outer y integral over [0,1] leaves this unchanged.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q05",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 4x dx dy.",
    "options": [
      "3",
      "1",
      "4",
      "2"
    ],
    "correctIndex": 3,
    "explanation": "Integrate in x: 4/2. The outer y integral over [0,1] leaves this unchanged.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q06",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 6x dx dy.",
    "options": [
      "2",
      "5",
      "3",
      "4"
    ],
    "correctIndex": 2,
    "explanation": "Integrate in x: 6/2. The outer y integral over [0,1] leaves this unchanged.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q07",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 4xy dx dy.",
    "options": [
      "3",
      "1",
      "2",
      "0"
    ],
    "correctIndex": 1,
    "explanation": "Separating over the unit square: 4·(1/2)·(1/2)=1.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q08",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 8xy dx dy.",
    "options": [
      "2",
      "3",
      "1",
      "4"
    ],
    "correctIndex": 0,
    "explanation": "Separating over the unit square: 8·(1/2)·(1/2)=2.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  },
  {
    "id": "ic05-q09",
    "moduleId": "IC05",
    "prompt": "Evaluate ∫₀¹∫₀¹ 12xy dx dy.",
    "options": [
      "4",
      "2",
      "5",
      "3"
    ],
    "correctIndex": 3,
    "explanation": "Separating over the unit square: 12·(1/2)·(1/2)=3.",
    "cognitive": "application",
    "reviewStatus": "draft",
    "sourceType": "original"
  }
];
export const CALCULUS_QUESTION_COUNTS={"DC01":9,"DC02":9,"DC03":9,"DC04":9,"DC05":9,"IC01":9,"IC02":9,"IC03":9,"IC04":9,"IC05":9} as const;
export const CALCULUS_APPROVED_EXAM_QUESTION_IDS:readonly string[]=[];
export const CALCULUS_EXAM_READY=false;
