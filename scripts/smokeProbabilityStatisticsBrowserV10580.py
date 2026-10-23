"""Browser smoke for v10.58.0 Probability & Statistics (requires npm ci, dev server and Playwright Chromium)."""
import os
from playwright.sync_api import sync_playwright
BASE=os.getenv('APP_URL','http://127.0.0.1:3000')
with sync_playwright() as pw:
    options={'headless':True}
    if os.getenv('CHROMIUM_PATH'): options['executable_path']=os.getenv('CHROMIUM_PATH')
    browser=pw.chromium.launch(**options)
    try:
        page=browser.new_page(viewport={'width':1280,'height':850})
        page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-probability-statistics').click(timeout=15000)
        page.locator('#probability-statistics-app-screen').wait_for(timeout=15000)
        assert page.locator('[id^="ps-module-"]').count()==8
        page.locator('#ps-lesson-PS01-01').click(timeout=15000)
        assert page.get_by_text('Populations, samples & data collection').count()>0
        assert page.get_by_text('My Learn Status').count()>0
        page.get_by_role('button',name='Practice this lesson').click(timeout=15000)
        page.locator('#ps-practice-panel').wait_for(timeout=15000)
        assert page.locator('#ps-practice-panel [role=radio]').count()==4
        page.locator('#ps-practice-panel [role=radio]').nth(1).click()
        page.get_by_role('button',name='Check Answer').click()
        assert page.get_by_text('Correct.',exact=False).count()>0
        page.get_by_role('button',name='Lessons',exact=True).click()
        page.get_by_role('button',name='Formulas',exact=True).click()
        assert page.locator('#ps-formulas-panel').is_visible()
        page.get_by_role('button',name='Mathematics',exact=True).click()
        page.locator('#mathematics-app-screen').wait_for(timeout=15000)
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2'),'Mobile horizontal overflow'
        print('PASS v10.58 P&S route, 8 modules, lesson reader, manual tracking, check-answer flow, formula navigation, return, mobile viewport')
    finally:
        browser.close()
