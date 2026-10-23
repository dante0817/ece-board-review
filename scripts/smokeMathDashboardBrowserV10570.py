"""Optional real-browser smoke for the v10.57 Mathematics home, with a running development server.
Requires Playwright and installed Chromium: pip install playwright; playwright install chromium
Run with APP_URL=http://localhost:3000 npm run smoke:mathematics:v10.57.0
"""
import os
from playwright.sync_api import sync_playwright

BASE=os.getenv('APP_URL','http://127.0.0.1:3000')
CHROME=os.getenv('CHROMIUM_PATH')

with sync_playwright() as pw:
    opts={'headless':True}
    if CHROME:opts['executable_path']=CHROME
    browser=pw.chromium.launch(**opts)
    try:
        page=browser.new_page(viewport={'width':1280,'height':850})
        page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
        page.locator('#nav-btn-mathematics').click(timeout=15000)
        page.locator('#mathematics-app-screen').wait_for(timeout=15000)
        assert page.locator('#mathematics-learn-panel').is_visible()
        assert page.locator('[id^="math-subject-"]').count()==12
        page.locator('#math-subject-probability-statistics').click()
        if page.locator('#probability-statistics-app-screen').count():
            assert page.locator('[id^="ps-module-"]').count()==8
            page.get_by_role('button',name='Mathematics',exact=True).click()
            page.locator('#mathematics-app-screen').wait_for(timeout=15000)
        else:
            assert page.get_by_role('dialog').get_by_text('Planned curriculum',exact=False).is_visible()
            assert page.get_by_role('dialog').get_by_text('Combinatorics and probability foundations').is_visible()
            page.get_by_role('button',name='Close curriculum preview').click()
        page.locator('#math-subject-analytic-geometry').click()
        page.locator('#analytic-geometry-app-screen').wait_for(timeout=15000)
        page.get_by_role('button',name='Mathematics',exact=True).click()
        page.locator('#mathematics-app-screen').wait_for(timeout=15000)
        assert page.get_by_role('button',name='Continue subject').is_visible()
        assert 'Analytic Geometry' in page.locator('section[aria-label="Continue learning"]').inner_text()
        page.locator('#math-tab-progress').click()
        assert page.locator('#mathematics-progress-panel').is_visible()
        page.locator('#math-tab-practice').click()
        page.get_by_role('button',name='Open Practice').click()
        page.locator('#practice-screen-root').wait_for(timeout=15000)
        page.locator('#nav-btn-mathematics').click()
        page.locator('#math-tab-exams').click()
        page.get_by_role('button',name='Open Exam Center').click()
        assert page.get_by_text('Board Examination & Mock Tests').is_visible()
        page.locator('#nav-btn-mathematics').click()
        page.set_viewport_size({'width':390,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2'), 'Mobile horizontal overflow'
        print('PASS Mathematics v10.57 desktop navigation, planned preview, recent subject, practice, exams, progress, mobile width')
    finally:
        browser.close()
