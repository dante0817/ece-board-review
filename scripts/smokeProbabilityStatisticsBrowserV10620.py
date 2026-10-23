"""Manual/CI browser smoke for the v10.62 PS01–PS04 expansion.
Requires a running dev server, installed Playwright, and Chromium.
Not executed in the source-only build environment.
"""
import os
from playwright.sync_api import sync_playwright
BASE=os.getenv('APP_URL','http://127.0.0.1:3000')
with sync_playwright() as pw:
    launch={'headless':True}
    if os.getenv('CHROMIUM_PATH'):launch['executable_path']=os.getenv('CHROMIUM_PATH')
    browser=pw.chromium.launch(**launch)
    try:
        page=browser.new_page(viewport={'width':1280,'height':850})
        page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#math-subject-probability-statistics').click(timeout=15000)
        page.locator('#probability-statistics-app-screen').wait_for(timeout=15000)
        assert page.get_by_text('80 introductory draft lessons').count()>0
        assert page.get_by_text('140 independent development practice questions').count()>0
        assert page.locator('[id^="ps-module-"]').count()==8
        page.locator('#ps-lesson-PS01-05').click(timeout=15000)
        assert page.get_by_text('Random, stratified, systematic and cluster sampling').count()>0
        page.get_by_role('button',name='Practice this lesson').click(timeout=15000)
        page.locator('#ps-practice-panel').wait_for(timeout=15000)
        assert page.get_by_text('Five shifts provide 6 randomly selected').count()>0
        page.get_by_role('radio',name='C. 30').click(timeout=15000)
        page.get_by_role('button',name='Check Answer').click(timeout=15000)
        assert page.get_by_text('Correct. Answer: 30').count()>0
        page.get_by_role('button',name='Lessons',exact=True).click(timeout=15000)
        page.locator('#ps-module-PS02').click(timeout=15000)
        page.locator('#ps-lesson-PS02-07').click(timeout=15000)
        assert page.get_by_text('Combinations with repetition and nonnegative selections').count()>0
        page.get_by_role('button',name='Back to Probability & Statistics').first.click(timeout=15000)
        page.locator('#ps-module-PS03').click(timeout=15000)
        page.locator('#ps-lesson-PS03-06').click(timeout=15000)
        assert page.get_by_text('Bayes theorem, sensor tests and predictive value').count()>0
        page.get_by_role('button',name='Back to Probability & Statistics').first.click(timeout=15000)
        page.locator('#ps-module-PS04').click(timeout=15000)
        page.locator('#ps-lesson-PS04-06').click(timeout=15000)
        assert page.get_by_text('Hypergeometric sampling versus binomial trials').count()>0
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2')
        print('PASS v10.62 browser: PS01 practice, PS02/PS03/PS04 new lessons, mobile layout')
    finally:browser.close()
