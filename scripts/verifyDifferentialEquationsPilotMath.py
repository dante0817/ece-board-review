#!/usr/bin/env python3
"""Optional independent symbolic checks for the three editorial DE GUI pilot lessons.
Requires sympy (QA-only dependency; never shipped into the browser bundle).
"""
import sympy as s
x,t,z=s.symbols('x t s',real=True)
for y,rhs,y0 in [(3*s.exp(x**2),lambda v:2*x*v,3),(2*s.exp(x*x/2),lambda v:x*v,2)]:
    assert s.simplify(s.diff(y,x)-rhs(y))==0
    assert y.subs(x,0)==y0
for a,b,r in [(-3,2,1),(-3,2,2),(-5,6,2),(-5,6,3)]:
    y=s.exp(r*x)
    assert s.simplify(s.diff(y,x,2)+a*s.diff(y,x)+b*y)==0
F=s.laplace_transform(2+3*t+s.exp(-2*t),t,z,noconds=True)
G=s.laplace_transform(t*t+2*s.exp(t),t,z,noconds=True)
assert s.simplify(F-(2/z+3/z**2+1/(z+2)))==0
assert s.simplify(G-(2/z**3+2/(z-1)))==0
print('PASS: pilot first-order IVPs, four higher-order characteristic-root residuals, two Laplace transforms.')
