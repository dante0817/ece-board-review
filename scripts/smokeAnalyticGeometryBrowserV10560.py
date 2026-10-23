"""Optional real Chromium acceptance after app is started; never changes server ports or kills processes.
Requires playwright + Chromium. BSECE_SMOKE_URL defaults to http://127.0.0.1:3000.
"""
import os
from playwright.sync_api import sync_playwright
BASE=os.getenv('BSECE_SMOKE_URL','http://127.0.0.1:3000')
KEY='ece_manual_learn_tracking_v1'
OLD={'reviewCount':2,'selfStatus':'studying','needsReview':False,'lastReviewedAt':'2026-10-01T09:00:00.000Z','updatedAt':'2026-10-01T09:00:00.000Z'}
fixture={'schemaVersion':1,'records':{'geo-plane-001':OLD,'geo-solid-036':OLD}}
with sync_playwright() as pw:
    args={'headless':True}
    if os.getenv('CHROMIUM_PATH'):args['executable_path']=os.environ['CHROMIUM_PATH']
    browser=pw.chromium.launch(**args)
    try:
        page=browser.new_page(viewport={'width':1366,'height':900})
        page.goto(BASE,wait_until='domcontentloaded',timeout=25000)
        page.evaluate('([k,v])=>localStorage.setItem(k,JSON.stringify(v))',[KEY,fixture])
        page.reload(wait_until='domcontentloaded')
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-geometry').click(timeout=15000)
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        page.locator('#btn-geometry-analytic-geometry').click(timeout=15000)
        screen=page.locator('#analytic-geometry-app-screen');screen.wait_for(timeout=15000)
        assert '27 lessons' in screen.inner_text()
        assert '44 formula notes' in screen.inner_text()
        assert '54 practice questions' in screen.inner_text()
        screen.get_by_role('button',name='GEO-079',exact=False).first.click(timeout=15000)
        assert screen.get_by_text('Worked examples',exact=True).count()>=1
        screen.get_by_role('button',name='Back to Analytic Geometry topics').click(timeout=15000)
        screen.get_by_role('tab',name='Formula library').click(timeout=15000)
        assert screen.get_by_text('Distance and midpoint').count()>=1
        screen.get_by_role('tab',name='Practice questions').click(timeout=15000)
        page.locator('#analytic-geometry-practice-panel').wait_for(timeout=15000)
        page.get_by_role('button',name='Question 1, GEO-079').click(timeout=15000)
        saved=page.evaluate('k=>JSON.parse(localStorage.getItem(k))',KEY)
        for id in fixture['records']:assert saved['records'][id]==OLD, f'Prior tracking record mutated: {id}'
        screen.get_by_role('button',name='Back to Geometry').click()
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        page.locator('#btn-geometry-plane-geometry').click()
        page.locator('#plane-geometry-app-screen').wait_for(timeout=15000)
        page.locator('#plane-geometry-app-screen').get_by_role('button',name='Back to Geometry').click()
        page.locator('#btn-geometry-solid-mensuration').click()
        page.locator('#solid-mensuration-app-screen').wait_for(timeout=15000)
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'), 'Mobile overflow'
        print('PASS Analytic Geometry browser v10.56.0: hub, lesson, formulas, practice, preserved storage, Plane/Solid access, mobile viewport')
    finally:browser.close()
