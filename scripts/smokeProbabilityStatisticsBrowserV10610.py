"""Optional v10.61 browser smoke. Run npm dev server and install Playwright Chromium first.
This script is included but has NOT been run as part of source-only verification.
"""
import os
from playwright.sync_api import sync_playwright
BASE=os.getenv('APP_URL','http://127.0.0.1:3000')
with sync_playwright() as pw:
    opts={'headless':True}
    if os.getenv('CHROMIUM_PATH'):opts['executable_path']=os.getenv('CHROMIUM_PATH')
    browser=pw.chromium.launch(**opts)
    try:
        page=browser.new_page(viewport={'width':1280,'height':850})
        page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-probability-statistics').click(timeout=15000)
        page.locator('#probability-statistics-app-screen').wait_for(timeout=15000)
        assert page.get_by_text('76 independent development practice questions').count()>0
        assert page.locator('[id^="ps-module-"]').count()==8
        page.locator('#ps-module-PS06').click(timeout=15000)
        page.locator('#ps-lesson-PS06-07').click(timeout=15000)
        assert page.get_by_text('Welch two-sample t tests').count()>0
        page.get_by_role('button',name='Practice this lesson').click(timeout=15000)
        page.locator('#ps-practice-panel').wait_for(timeout=15000)
        assert page.get_by_text('Two independent groups have s1=6').count()>0
        page.locator('#ps-practice-panel [role=radio]').nth(1).click()
        page.get_by_role('button',name='Check Answer').click()
        assert page.get_by_text('Correct.',exact=False).count()>0
        page.get_by_role('button',name='Lessons',exact=True).click()
        page.locator('#ps-module-PS07').click(timeout=15000)
        page.locator('#ps-lesson-PS07-07').click(timeout=15000)
        assert page.get_by_text('Mean-response confidence versus prediction intervals').count()>0
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2')
        print('PASS v10.61 P&S browser: PS06 Welch practice, keyed feedback, PS07 prediction lesson, mobile width')
    finally:browser.close()
