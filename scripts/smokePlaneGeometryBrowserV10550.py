"""Local-only optional browser acceptance; start the app first.

Requires: pip install playwright ; python -m playwright install chromium
To use a nondefault app port: set BSECE_SMOKE_URL=http://127.0.0.1:3001
Never stops existing development servers or opens the user's own browser profile.
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.getenv('BSECE_SMOKE_URL', 'http://127.0.0.1:3000')
KEY = 'ece_manual_learn_tracking_v1'
OLD = {'reviewCount':2,'selfStatus':'studying','needsReview':False,'lastReviewedAt':'2026-10-01T10:00:00.000Z','updatedAt':'2026-10-01T10:00:00.000Z'}
fixture={'schemaVersion':1,'records':{'geo-solid-036':OLD}}
with sync_playwright() as pw:
    args={'headless':True}
    chrome=os.getenv('CHROMIUM_PATH')
    if chrome:args['executable_path']=chrome
    browser=pw.chromium.launch(**args)
    try:
        page=browser.new_page(viewport={'width':1366,'height':900})
        page.goto(BASE,wait_until='domcontentloaded',timeout=25000)
        page.evaluate('([key,value])=>localStorage.setItem(key,JSON.stringify(value))',[KEY,fixture])
        page.reload(wait_until='domcontentloaded')
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-geometry').click(timeout=15000)
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        page.locator('#btn-geometry-plane-geometry').click(timeout=15000)
        page.locator('#plane-geometry-app-screen').wait_for(timeout=15000)
        assert '35 lessons' in page.locator('#plane-geometry-app-screen').inner_text()
        assert '42 formula notes' in page.locator('#plane-geometry-app-screen').inner_text()
        assert '70 practice questions' in page.locator('#plane-geometry-app-screen').inner_text()
        page.locator('button').filter(has_text='GEO-001').first.click(timeout=15000)
        assert page.get_by_text('Worked examples',exact=True).count()>=1
        page.get_by_role('button',name='Back to Plane Geometry topics').click(timeout=15000)
        page.get_by_role('tab',name='Practice questions').click(timeout=15000)
        page.locator('#plane-geometry-practice-panel').wait_for(timeout=15000)
        assert page.get_by_role('button',name='Question 1, GEO-001').count()==1
        page.locator('#plane-geometry-app-screen').get_by_role('button',name='Back to Geometry').click()
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        page.locator('#btn-geometry-solid-mensuration').click()
        page.locator('#solid-mensuration-app-screen').wait_for(timeout=15000)
        saved=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
        assert saved['records']['geo-solid-036']==OLD, 'Existing Solid study history mutated'
        page.get_by_role('navigation',name='Breadcrumbs').get_by_role('button',name='Geometry').click()
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+2'), 'Mobile width overflow'
        print('PASS v10.55.0 browser: Plane lessons/formulas/practice; Solid route and storage; mobile layout')
    finally:
        browser.close()
