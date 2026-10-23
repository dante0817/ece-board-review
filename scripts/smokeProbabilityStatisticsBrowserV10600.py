"""Optional browser smoke: start npm run dev first, then launch using Playwright Chromium.
No browser test success is claimed unless this script is actually run and passes.
"""
import os
from playwright.sync_api import sync_playwright
BASE=os.getenv('APP_URL','http://127.0.0.1:3000')
with sync_playwright() as pw:
    options={'headless':True}
    if os.getenv('CHROMIUM_PATH'):options['executable_path']=os.getenv('CHROMIUM_PATH')
    browser=pw.chromium.launch(**options)
    try:
        page=browser.new_page(viewport={'width':1280,'height':850})
        page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-probability-statistics').click(timeout=15000)
        page.locator('#probability-statistics-app-screen').wait_for(timeout=15000)
        assert page.get_by_text('44 independent development practice questions').count()>0
        assert page.locator('[id^="ps-module-"]').count()==8
        page.locator('#ps-module-PS05').click(timeout=15000)
        page.locator('#ps-lesson-PS05-05').click(timeout=15000)
        assert page.get_by_text('Central limit theorem: when normal approximations work').count()>0
        page.get_by_role('button',name='Practice this lesson').click(timeout=15000)
        page.locator('#ps-practice-panel').wait_for(timeout=15000)
        assert page.get_by_text('A random sample of 100 independent devices').count()>0
        assert page.get_by_text('Population σ=12 and n=36').count()==0
        page.locator('#ps-practice-panel [role=radio]').nth(1).click()
        page.get_by_role('button',name='Check Answer').click()
        assert page.get_by_text('Correct.',exact=False).count()>0
        page.get_by_role('button',name='Lessons',exact=True).click()
        page.locator('#ps-module-PS08').click()
        page.locator('#ps-lesson-PS08-08').click()
        assert page.get_by_text('Randomized complete block ANOVA calculations').count()>0
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2')
        print('PASS v10.60 P&S browser: unseen practice isolation, PS05/PS08 learning, answer checking, mobile width')
    finally:browser.close()
