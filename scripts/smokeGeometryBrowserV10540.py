"""Optional Playwright browser acceptance. Start `npm run dev` first.
Isolated browser context only, never touches the user's regular browser data.
Set BSECE_SMOKE_URL to avoid conflicts with other services on ports 3000/24678.
"""
import os
from playwright.sync_api import sync_playwright

BASE=os.getenv('BSECE_SMOKE_URL','http://127.0.0.1:3000')
CHROME=os.getenv('CHROMIUM_PATH')
KEY='ece_manual_learn_tracking_v1'
FIXTURE={'schemaVersion':1,'records':{'geo-solid-036':{'reviewCount':2,'selfStatus':'studying','needsReview':False,'lastReviewedAt':'2026-10-01T10:00:00.000Z','updatedAt':'2026-10-01T10:00:00.000Z'}}}

with sync_playwright() as pw:
    args={'headless':True}
    if CHROME: args['executable_path']=CHROME
    browser=pw.chromium.launch(**args)
    try:
        page=browser.new_page(viewport={'width':1366,'height':900})
        page.goto(BASE,wait_until='domcontentloaded',timeout=25000)
        page.evaluate('(data)=>localStorage.setItem(data[0],JSON.stringify(data[1]))',[KEY,FIXTURE])
        page.reload(wait_until='domcontentloaded')
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-geometry').click(timeout=15000)
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        assert page.locator('#geometry-app-screen').get_by_text('43 lessons · 73 formulas · 172 practice questions').count()==1
        page.locator('#btn-geometry-plane-geometry').click()
        page.locator('#plane-geometry-app-screen').wait_for(timeout=15000)
        page.get_by_role('button',name='Back to Geometry').click()
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        page.locator('#btn-geometry-analytic-geometry').click()
        page.locator('#analytic-geometry-app-screen').wait_for(timeout=15000)
        page.get_by_role('button',name='Back to Geometry').click()
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        page.locator('#btn-geometry-solid-mensuration').click()
        page.locator('#solid-mensuration-app-screen').wait_for(timeout=15000)
        assert '172' in page.locator('#solid-mensuration-app-screen').inner_text()
        # The Geometry breadcrumb is now the intermediate parent.
        page.get_by_role('navigation',name='Breadcrumbs').get_by_role('button',name='Geometry').click()
        page.locator('#geometry-app-screen').wait_for(timeout=15000)
        stored=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
        assert stored==FIXTURE, 'Previously saved manual study record changed'
        page.set_viewport_size({'width':390,'height':844})
        assert page.locator('#geometry-app-screen').is_visible()
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2'), 'Mobile horizontal overflow'
        page.get_by_role('button',name='Back to Mathematics').click()
        page.locator('#math-subject-geometry').wait_for(timeout=15000)
        print('PASS Geometry v10.54: hub, planned previews, Solid route, breadcrumbs, storage fixture and responsive width')
    finally:
        browser.close()
